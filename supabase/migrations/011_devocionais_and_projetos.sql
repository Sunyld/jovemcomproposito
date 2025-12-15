-- Devocionais table
create table if not exists devocionais (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  day_number integer check (day_number >= 1 and day_number <= 7) not null,
  scheduled_date date,
  published boolean default false,
  published_at timestamp with time zone,
  created_by uuid references profiles(id) not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(day_number, scheduled_date)
);

-- Projetos table
create table if not exists projetos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  cover_url text,
  type text check (type in ('voluntariado','projeto-pratico','comunidade')) not null,
  status text check (status in ('aberto','fechado','concluido')) default 'aberto',
  max_volunteers integer,
  created_by uuid references profiles(id) not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Projeto Inscricoes table
create table if not exists projeto_inscricoes (
  id uuid primary key default gen_random_uuid(),
  projeto_id uuid references projetos(id) on delete cascade not null,
  user_id uuid references profiles(id) not null,
  message text,
  status text check (status in ('pendente','aprovado','rejeitado')) default 'pendente',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(projeto_id, user_id)
);

-- Indexes
create index if not exists idx_devocionais_scheduled_date on devocionais(scheduled_date);
create index if not exists idx_devocionais_published on devocionais(published);
create index if not exists idx_devocionais_day_number on devocionais(day_number);
create index if not exists idx_projetos_status on projetos(status);
create index if not exists idx_projeto_inscricoes_projeto_id on projeto_inscricoes(projeto_id);
create index if not exists idx_projeto_inscricoes_user_id on projeto_inscricoes(user_id);

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_devocionais_updated_at ON devocionais;
create trigger update_devocionais_updated_at before update on devocionais
  for each row execute function update_updated_at_column();

DROP TRIGGER IF EXISTS update_projetos_updated_at ON projetos;
create trigger update_projetos_updated_at before update on projetos
  for each row execute function update_updated_at_column();

DROP TRIGGER IF EXISTS update_projeto_inscricoes_updated_at ON projeto_inscricoes;
create trigger update_projeto_inscricoes_updated_at before update on projeto_inscricoes
  for each row execute function update_updated_at_column();

-- Function to publish devocional and create notifications
create or replace function publish_devocional_and_notify()
returns trigger as $$
declare
  user_record record;
begin
  -- Only create notifications when devocional is published
  if NEW.published = true and (OLD.published is null or OLD.published = false) then
    -- Create notifications for all users
    for user_record in select id from profiles where role in ('user', 'mentor', 'admin')
    loop
      insert into notifications (user_id, type, title, message, link)
      values (
        user_record.id,
        'sistema',
        'Novo Devocional Disponível',
        NEW.title,
        '/devocional'
      );
    end loop;
  end if;
  return NEW;
end;
$$ language plpgsql security definer;

-- Trigger to create notifications when devocional is published
DROP TRIGGER IF EXISTS on_devocional_published ON devocionais;
create trigger on_devocional_published
  after update on devocionais
  for each row
  when (NEW.published = true and (OLD.published is null or OLD.published = false))
  execute function publish_devocional_and_notify();

-- Function to clean old devocionais every Sunday at 00:00
-- This will be called by a cron job or scheduled function
create or replace function clean_old_devocionais()
returns void as $$
begin
  -- Delete devocionais older than 7 days
  delete from devocionais
  where scheduled_date < current_date - interval '7 days';
end;
$$ language plpgsql security definer;

-- Enable RLS
alter table devocionais enable row level security;
alter table projetos enable row level security;
alter table projeto_inscricoes enable row level security;

-- Devocionais policies
DROP POLICY IF EXISTS "Devocionais are viewable by everyone" ON devocionais;
create policy "Devocionais are viewable by everyone"
  on devocionais for select
  using (published = true);

DROP POLICY IF EXISTS "Admins can manage devocionais" ON devocionais;
create policy "Admins can manage devocionais"
  on devocionais for all
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Projetos policies
DROP POLICY IF EXISTS "Projetos are viewable by everyone" ON projetos;
create policy "Projetos are viewable by everyone"
  on projetos for select
  using (true);

DROP POLICY IF EXISTS "Admins can manage projetos" ON projetos;
create policy "Admins can manage projetos"
  on projetos for all
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Projeto Inscricoes policies
DROP POLICY IF EXISTS "Users can view own projeto inscricoes" ON projeto_inscricoes;
create policy "Users can view own projeto inscricoes"
  on projeto_inscricoes for select
  using (user_id = auth.uid() or exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  ));

DROP POLICY IF EXISTS "Users can create projeto inscricoes" ON projeto_inscricoes;
create policy "Users can create projeto inscricoes"
  on projeto_inscricoes for insert
  with check (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage projeto inscricoes" ON projeto_inscricoes;
create policy "Admins can manage projeto inscricoes"
  on projeto_inscricoes for all
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Update notifications type to include 'devocional'
alter table notifications drop constraint if exists notifications_type_check;
alter table notifications add constraint notifications_type_check 
  check (type in ('inscricao','aprovacao','feedback','sistema','devocional'));

