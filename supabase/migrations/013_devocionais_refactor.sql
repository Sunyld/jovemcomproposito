-- Drop existing devocionais table and recreate with new structure
DROP TABLE IF EXISTS devocionais CASCADE;

-- Devocional Series table (for 7-day series)
create table if not exists devocional_series (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  start_at timestamp with time zone not null,
  status text check (status in ('draft','active','expired')) default 'draft',
  tipo text check (tipo in ('series','single')) not null,
  created_by uuid references profiles(id) not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Devocional Items table (individual devocionais in a series or single)
create table if not exists devocional_items (
  id uuid primary key default gen_random_uuid(),
  series_id uuid references devocional_series(id) on delete cascade not null,
  day_number integer check (day_number >= 1 and day_number <= 7),
  title text not null,
  content text not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(series_id, day_number)
);

-- Indexes
create index if not exists idx_devocional_series_status on devocional_series(status);
create index if not exists idx_devocional_series_start_at on devocional_series(start_at);
create index if not exists idx_devocional_series_tipo on devocional_series(tipo);
create index if not exists idx_devocional_items_series_id on devocional_items(series_id);

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_devocional_series_updated_at ON devocional_series;
create trigger update_devocional_series_updated_at before update on devocional_series
  for each row execute function update_updated_at_column();

DROP TRIGGER IF EXISTS update_devocional_items_updated_at ON devocional_items;
create trigger update_devocional_items_updated_at before update on devocional_items
  for each row execute function update_updated_at_column();

-- Function to deactivate all active devocionais when a new one is published
create or replace function deactivate_other_devocionais()
returns trigger as $$
begin
  -- Only deactivate others when status changes to 'active'
  if NEW.status = 'active' and (OLD.status is null or OLD.status != 'active') then
    -- Deactivate all other active devocionais
    update devocional_series
    set status = 'expired'
    where status = 'active'
      and id != NEW.id;
  end if;
  return NEW;
end;
$$ language plpgsql security definer;

-- Trigger to ensure only one active devocional
DROP TRIGGER IF EXISTS ensure_single_active_devocional ON devocional_series;
create trigger ensure_single_active_devocional
  before insert or update on devocional_series
  for each row
  execute function deactivate_other_devocionais();

-- Function to create notifications when devocional becomes active
create or replace function notify_devocional_active()
returns trigger as $$
declare
  user_record record;
  devocional_title text;
  notification_message text;
begin
  -- Only create notifications when status changes to 'active'
  if NEW.status = 'active' and (OLD.status is null or OLD.status != 'active') then
    -- Get devocional title (first item for series, or single item)
    select title into devocional_title
    from devocional_items
    where series_id = NEW.id
    order by day_number asc
    limit 1;

    -- Build notification message with title
    if devocional_title is not null then
      notification_message := 'Leia o devocional do dia: ' || devocional_title;
    else
      notification_message := 'Leia o devocional do dia';
    end if;

    -- Create notifications for all users
    for user_record in select id from profiles where role in ('user', 'mentor', 'admin')
    loop
      insert into notifications (user_id, type, title, message, link)
      values (
        user_record.id,
        'devocional',
        'Novo Devocional Disponível',
        notification_message,
        '/devocional'
      );
    end loop;
  end if;
  return NEW;
end;
$$ language plpgsql security definer;

-- Trigger to create notifications when devocional becomes active
DROP TRIGGER IF EXISTS on_devocional_activated ON devocional_series;
create trigger on_devocional_activated
  after update on devocional_series
  for each row
  when (NEW.status = 'active' and (OLD.status is null or OLD.status != 'active'))
  execute function notify_devocional_active();

-- Function to get active devocional (calculates which item should be active for series)
create or replace function get_active_devocional()
returns table (
  series_id uuid,
  item_id uuid,
  title text,
  content text,
  day_number integer,
  tipo text,
  start_at timestamp with time zone,
  expires_at timestamp with time zone
) as $$
declare
  active_series record;
  hours_since_start numeric;
  active_index integer;
begin
  -- Find active series
  select * into active_series
  from devocional_series
  where status = 'active'
  order by start_at desc
  limit 1;

  if active_series is null then
    return;
  end if;

  -- Calculate hours since start
  hours_since_start := extract(epoch from (now() - active_series.start_at)) / 3600;

  -- For single devocionais, check if expired
  if active_series.tipo = 'single' then
    -- Check if expired (24h passed)
    if hours_since_start >= 24 then
      -- Mark as expired
      update devocional_series
      set status = 'expired'
      where id = active_series.id;
      return;
    end if;

    return query
    select 
      active_series.id as series_id,
      di.id as item_id,
      di.title,
      di.content,
      coalesce(di.day_number, 1) as day_number,
      active_series.tipo,
      active_series.start_at,
      active_series.start_at + interval '24 hours' as expires_at
    from devocional_items di
    where di.series_id = active_series.id
    limit 1;
    return;
  end if;

  -- For series, calculate which day should be active
  active_index := floor(hours_since_start / 24);

  -- If series expired (7 days passed), mark as expired and return nothing
  if active_index >= 7 then
    update devocional_series
    set status = 'expired'
    where id = active_series.id;
    return;
  end if;

  -- Return the active item (day_number = active_index + 1)
  return query
  select 
    active_series.id as series_id,
    di.id as item_id,
    di.title,
    di.content,
    di.day_number,
    active_series.tipo,
    active_series.start_at,
    active_series.start_at + interval '24 hours' * (active_index + 1) as expires_at
  from devocional_items di
  where di.series_id = active_series.id
    and di.day_number = active_index + 1;
end;
$$ language plpgsql security definer;

-- Enable RLS
alter table devocional_series enable row level security;
alter table devocional_items enable row level security;

-- Devocional Series policies
DROP POLICY IF EXISTS "Active devocionais are viewable by everyone" ON devocional_series;
create policy "Active devocionais are viewable by everyone"
  on devocional_series for select
  using (status = 'active');

DROP POLICY IF EXISTS "Admins can manage devocional series" ON devocional_series;
create policy "Admins can manage devocional series"
  on devocional_series for all
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Devocional Items policies
DROP POLICY IF EXISTS "Devocional items are viewable with series" ON devocional_items;
create policy "Devocional items are viewable with series"
  on devocional_items for select
  using (
    exists (
      select 1 from devocional_series
      where id = devocional_items.series_id
        and (status = 'active' or exists (
          select 1 from profiles where id = auth.uid() and role = 'admin'
        ))
    )
  );

DROP POLICY IF EXISTS "Admins can manage devocional items" ON devocional_items;
create policy "Admins can manage devocional items"
  on devocional_items for all
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

