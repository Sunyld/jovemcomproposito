-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text default 'user' check (role in ('visitor','user','mentor','admin')),
  bio text,
  avatar_url text,
  is_mentor_approved boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Categories table
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Mentorias table
create table if not exists mentorias (
  id uuid primary key default gen_random_uuid(),
  mentor_id uuid references profiles(id) not null,
  title text not null,
  description text not null,
  cover_url text,
  category_id uuid references categories(id),
  type text check (type in ('online','presencial','documento')) not null,
  price numeric not null default 0,
  currency text default 'MZN',
  external_link text,
  document_path text,
  published boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Inscritos table
create table if not exists inscritos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) not null,
  mentoria_id uuid references mentorias(id) not null,
  message text,
  has_access boolean default false,
  payment_status text default 'pending' check (payment_status in ('pending','paid','failed')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(user_id, mentoria_id)
);

-- Feedback table
create table if not exists feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) not null,
  mentoria_id uuid references mentorias(id) not null,
  rating integer check (rating >= 1 and rating <= 5) not null,
  comment text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(user_id, mentoria_id)
);

-- Notifications table
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) not null,
  type text check (type in ('inscricao','aprovacao','feedback','sistema')) not null,
  title text not null,
  message text not null,
  read boolean default false,
  link text,
  created_at timestamp with time zone default now()
);

-- Donations table
create table if not exists donations (
  id uuid primary key default gen_random_uuid(),
  title text not null unique,
  description text not null,
  detail text not null,
  reference text not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Indexes
create index if not exists idx_mentorias_mentor_id on mentorias(mentor_id);
create index if not exists idx_mentorias_category_id on mentorias(category_id);
create index if not exists idx_mentorias_published on mentorias(published);
create index if not exists idx_inscritos_user_id on inscritos(user_id);
create index if not exists idx_inscritos_mentoria_id on inscritos(mentoria_id);
create index if not exists idx_feedback_mentoria_id on feedback(mentoria_id);
create index if not exists idx_notifications_user_id on notifications(user_id);
create index if not exists idx_notifications_read on notifications(read);

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
create trigger update_profiles_updated_at before update on profiles
  for each row execute function update_updated_at_column();

DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
create trigger update_categories_updated_at before update on categories
  for each row execute function update_updated_at_column();

DROP TRIGGER IF EXISTS update_mentorias_updated_at ON mentorias;
create trigger update_mentorias_updated_at before update on mentorias
  for each row execute function update_updated_at_column();

DROP TRIGGER IF EXISTS update_inscritos_updated_at ON inscritos;
create trigger update_inscritos_updated_at before update on inscritos
  for each row execute function update_updated_at_column();

DROP TRIGGER IF EXISTS update_feedback_updated_at ON feedback;
create trigger update_feedback_updated_at before update on feedback
  for each row execute function update_updated_at_column();

DROP TRIGGER IF EXISTS update_donations_updated_at ON donations;
create trigger update_donations_updated_at before update on donations
  for each row execute function update_updated_at_column();

-- Function to automatically create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    coalesce(new.raw_user_meta_data->>'role', 'user'),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

