-- Enable Row Level Security on all tables
alter table profiles enable row level security;
alter table categories enable row level security;
alter table mentorias enable row level security;
alter table inscritos enable row level security;
alter table feedback enable row level security;
alter table notifications enable row level security;
alter table donations enable row level security;

-- Profiles policies
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
create policy "Profiles are viewable by everyone"
  on profiles for select
  using (true);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;
create policy "Admins can update any profile"
  on profiles for update
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can insert profiles" ON profiles;
create policy "Admins can insert profiles"
  on profiles for insert
  with check (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Categories policies
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;
create policy "Categories are viewable by everyone"
  on categories for select
  using (true);

DROP POLICY IF EXISTS "Admins can manage categories" ON categories;
create policy "Admins can manage categories"
  on categories for all
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Mentorias policies
DROP POLICY IF EXISTS "Published mentorias are viewable by everyone" ON mentorias;
create policy "Published mentorias are viewable by everyone"
  on mentorias for select
  using (published = true or mentor_id = auth.uid());

DROP POLICY IF EXISTS "Mentors and admins can create mentorias" ON mentorias;
create policy "Mentors and admins can create mentorias"
  on mentorias for insert
  with check (
    exists (
      select 1 from profiles
      where id = auth.uid() and (
        role = 'admin' or (role = 'mentor' and is_mentor_approved = true)
      )
    )
  );

DROP POLICY IF EXISTS "Mentors can update own mentorias" ON mentorias;
create policy "Mentors can update own mentorias"
  on mentorias for update
  using (mentor_id = auth.uid());

DROP POLICY IF EXISTS "Admins can update any mentoria" ON mentorias;
create policy "Admins can update any mentoria"
  on mentorias for update
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Mentors and admins can delete own mentorias" ON mentorias;
create policy "Mentors and admins can delete own mentorias"
  on mentorias for delete
  using (
    mentor_id = auth.uid() or
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Inscritos policies
DROP POLICY IF EXISTS "Users can view own inscricoes" ON inscritos;
create policy "Users can view own inscricoes"
  on inscritos for select
  using (user_id = auth.uid());

DROP POLICY IF EXISTS "Mentors can view inscricoes for their mentorias" ON inscritos;
create policy "Mentors can view inscricoes for their mentorias"
  on inscritos for select
  using (
    exists (
      select 1 from mentorias
      where id = inscritos.mentoria_id and mentor_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can view all inscricoes" ON inscritos;
create policy "Admins can view all inscricoes"
  on inscritos for select
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Users can create own inscricoes" ON inscritos;
create policy "Users can create own inscricoes"
  on inscritos for insert
  with check (auth.uid() = user_id);

DROP POLICY IF EXISTS "Mentors can update inscricoes for their mentorias" ON inscritos;
create policy "Mentors can update inscricoes for their mentorias"
  on inscritos for update
  using (
    exists (
      select 1 from mentorias
      where id = inscritos.mentoria_id and mentor_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can update any inscricao" ON inscritos;
create policy "Admins can update any inscricao"
  on inscritos for update
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Feedback policies
DROP POLICY IF EXISTS "Feedback is viewable by mentor and admins" ON feedback;
create policy "Feedback is viewable by mentor and admins"
  on feedback for select
  using (
    exists (
      select 1 from mentorias
      where id = feedback.mentoria_id and (
        mentor_id = auth.uid() or
        exists (
          select 1 from profiles
          where id = auth.uid() and role = 'admin'
        )
      )
    ) or user_id = auth.uid()
  );

DROP POLICY IF EXISTS "Users can create feedback for enrolled mentorias" ON feedback;
create policy "Users can create feedback for enrolled mentorias"
  on feedback for insert
  with check (
    auth.uid() = user_id and
    exists (
      select 1 from inscritos
      where user_id = auth.uid() and mentoria_id = feedback.mentoria_id and has_access = true
    )
  );

DROP POLICY IF EXISTS "Users can update own feedback" ON feedback;
create policy "Users can update own feedback"
  on feedback for update
  using (auth.uid() = user_id);

-- Notifications policies
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
create policy "Users can view own notifications"
  on notifications for select
  using (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
create policy "Users can update own notifications"
  on notifications for update
  using (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can create notifications" ON notifications;
create policy "System can create notifications"
  on notifications for insert
  with check (true);

-- Donations policies
DROP POLICY IF EXISTS "Donations are viewable by everyone" ON donations;
create policy "Donations are viewable by everyone"
  on donations for select
  using (true);

DROP POLICY IF EXISTS "Admins can manage donations" ON donations;
create policy "Admins can manage donations"
  on donations for all
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Function to delete user and associated profile
create or replace function public.delete_user()
returns void as $$
begin
  delete from auth.users where id = auth.uid();
end;
$$ language plpgsql security definer;

