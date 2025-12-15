-- ============================================
-- CRIAR USUÁRIO ADMINISTRADOR DIRETAMENTE NO BANCO
-- ============================================
-- Este script cria o usuário diretamente na tabela auth.users
-- Execute no Supabase SQL Editor

-- Habilitar extensão pgcrypto se não estiver habilitada
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  admin_user_id UUID;
  admin_email TEXT := 'Sunyldjosesomailamatapa@gmail.com';
  admin_password TEXT := '123456';
  encrypted_pwd TEXT;
  instance_id UUID := '00000000-0000-0000-0000-000000000000'::uuid;
BEGIN
  -- Verificar se o usuário já existe
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = admin_email;

  IF admin_user_id IS NULL THEN
    -- Gerar UUID para o novo usuário
    admin_user_id := gen_random_uuid();
    
    -- Criar hash da senha usando bcrypt
    encrypted_pwd := crypt(admin_password, gen_salt('bf', 10));

    -- Inserir usuário na tabela auth.users
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token,
      is_super_admin
    )
    VALUES (
      instance_id,
      admin_user_id,
      'authenticated',
      'authenticated',
      admin_email,
      encrypted_pwd,
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Administrador JCP"}'::jsonb,
      now(),
      now(),
      '',
      '',
      '',
      '',
      false
    );

    RAISE NOTICE '✅ Usuário admin criado na tabela auth.users: %', admin_user_id;
  ELSE
    RAISE NOTICE 'ℹ️ Usuário já existe: %', admin_user_id;
  END IF;

  -- Criar ou atualizar perfil na tabela public.profiles
  IF admin_user_id IS NOT NULL THEN
    -- Atualizar perfil existente
    UPDATE public.profiles
    SET 
      role = 'admin',
      full_name = 'Administrador JCP',
      is_mentor_approved = true,
      updated_at = now()
    WHERE id = admin_user_id;

    -- Se o perfil não existir, criar
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = admin_user_id) THEN
      INSERT INTO public.profiles (id, full_name, role, is_mentor_approved, created_at, updated_at)
      VALUES (
        admin_user_id,
        'Administrador JCP',
        'admin',
        true,
        now(),
        now()
      );
      RAISE NOTICE '✅ Perfil admin criado: %', admin_user_id;
    ELSE
      RAISE NOTICE '✅ Perfil admin atualizado: %', admin_user_id;
    END IF;
  END IF;
END $$;

-- Verificar se foi criado corretamente
SELECT 
  'VERIFICAÇÃO FINAL' as status,
  p.id::text as user_id,
  p.full_name as nome,
  u.email as email,
  p.role as role,
  p.is_mentor_approved as aprovado,
  u.email_confirmed_at as email_confirmado,
  u.created_at as criado_em
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'Sunyldjosesomailamatapa@gmail.com';

-- Contar usuários na tabela auth.users
SELECT 
  'TOTAL DE USUÁRIOS' as info,
  COUNT(*)::text as total
FROM auth.users;

-- Contar perfis na tabela profiles
SELECT 
  'TOTAL DE PERFIS' as info,
  COUNT(*)::text as total
FROM public.profiles;

