-- Function to create notification when inscricao is created
create or replace function notify_inscricao_created()
returns trigger as $$
begin
  -- Notify mentor about new inscricao
  insert into notifications (user_id, type, title, message, link)
  values (
    (select mentor_id from mentorias where id = NEW.mentoria_id),
    'inscricao',
    'Nova Inscrição',
    'Um novo aluno se inscreveu na sua mentoria.',
    '/dashboard/mentor/inscricoes'
  );
  return NEW;
end;
$$ language plpgsql security definer;

-- Trigger for inscricao creation
DROP TRIGGER IF EXISTS on_inscricao_created ON inscritos;
create trigger on_inscricao_created
  after insert on inscritos
  for each row
  execute function notify_inscricao_created();

-- Function to create notification when inscricao is approved
create or replace function notify_inscricao_approved()
returns trigger as $$
begin
  -- Only notify if access was granted
  if NEW.has_access = true and (OLD.has_access is null or OLD.has_access = false) then
    insert into notifications (user_id, type, title, message, link)
    values (
      NEW.user_id,
      'aprovacao',
      'Inscrição Aprovada',
      'Sua inscrição foi aprovada! Você agora tem acesso à mentoria.',
      '/dashboard/user/mentorias'
    );
  end if;
  return NEW;
end;
$$ language plpgsql security definer;

-- Trigger for inscricao approval
DROP TRIGGER IF EXISTS on_inscricao_approved ON inscritos;
create trigger on_inscricao_approved
  after update on inscritos
  for each row
  when (NEW.has_access = true and (OLD.has_access is null or OLD.has_access = false))
  execute function notify_inscricao_approved();

-- Function to create notification when feedback is created
create or replace function notify_feedback_created()
returns trigger as $$
begin
  -- Notify mentor about new feedback
  insert into notifications (user_id, type, title, message, link)
  values (
    (select mentor_id from mentorias where id = NEW.mentoria_id),
    'feedback',
    'Novo Feedback',
    'Você recebeu um novo feedback na sua mentoria.',
    '/dashboard/mentor/feedback'
  );
  return NEW;
end;
$$ language plpgsql security definer;

-- Trigger for feedback creation
DROP TRIGGER IF EXISTS on_feedback_created ON feedback;
create trigger on_feedback_created
  after insert on feedback
  for each row
  execute function notify_feedback_created();

-- Function to schedule devocional notifications at 7 AM
-- This function should be called by a cron job or scheduled function
create or replace function send_devocional_notifications()
returns void as $$
declare
  devocional_record record;
  user_record record;
begin
  -- Get today's devocional
  select * into devocional_record
  from devocionais
  where scheduled_date = current_date
    and published = true
  limit 1;

  -- If devocional exists, create notifications for all users
  if devocional_record is not null then
    for user_record in select id from profiles where role in ('user', 'mentor', 'admin')
    loop
      -- Check if notification already exists
      if not exists (
        select 1 from notifications
        where user_id = user_record.id
          and type = 'devocional'
          and link = '/devocional'
          and created_at::date = current_date
      ) then
        insert into notifications (user_id, type, title, message, link)
        values (
          user_record.id,
          'devocional',
          'Novo Devocional Disponível',
          devocional_record.title,
          '/devocional'
        );
      end if;
    end loop;
  end if;
end;
$$ language plpgsql security definer;

-- Note: To schedule this function to run daily at 7 AM, you need to:
-- 1. Use Supabase Edge Functions with a cron trigger, OR
-- 2. Use pg_cron extension (if available), OR
-- 3. Use an external cron service that calls this function via HTTP

