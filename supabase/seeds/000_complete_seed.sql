-- ============================================
-- SCRIPT COMPLETO DE SEED - JOVEM COM PROPÓSITO
-- ============================================
-- Execute este script no Supabase SQL Editor
-- 
-- ⚠️ IMPORTANTE: 
-- 1. Crie o usuário admin manualmente no Dashboard primeiro:
--    Authentication > Users > Add User
--    Email: Sunyldjosesomailamatapa@gmail.com
--    Password: 123456
--    Auto Confirm User: ✅
--
-- 2. Depois execute este script completo

-- ============================================
-- PARTE 1: CONFIGURAR USUÁRIO ADMINISTRADOR
-- ============================================
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Buscar o ID do usuário admin pelo email
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'Sunyldjosesomailamatapa@gmail.com';

  IF admin_user_id IS NOT NULL THEN
    -- Atualizar perfil existente para admin
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
    END IF;

    RAISE NOTICE '✅ Usuário admin configurado: %', admin_user_id;
  ELSE
    RAISE NOTICE '⚠️ Usuário não encontrado. Crie o usuário no Dashboard primeiro.';
  END IF;
END $$;

-- ============================================
-- PARTE 2: CRIAR CATEGORIAS
-- ============================================
INSERT INTO public.categories (id, name, slug, created_at, updated_at)
SELECT gen_random_uuid(), 'Mentoria de Carreira', 'mentoria-carreira', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'mentoria-carreira');

INSERT INTO public.categories (id, name, slug, created_at, updated_at)
SELECT gen_random_uuid(), 'Comunicação & Soft Skills', 'comunicacao-soft-skills', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'comunicacao-soft-skills');

INSERT INTO public.categories (id, name, slug, created_at, updated_at)
SELECT gen_random_uuid(), 'Finanças e Empreendedorismo', 'financas-empreendedorismo', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'financas-empreendedorismo');

INSERT INTO public.categories (id, name, slug, created_at, updated_at)
SELECT gen_random_uuid(), 'Ciência & Tecnologia', 'ciencia-tecnologia', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'ciencia-tecnologia');

INSERT INTO public.categories (id, name, slug, created_at, updated_at)
SELECT gen_random_uuid(), 'Liderança & Gestão', 'lideranca-gestao', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'lideranca-gestao');

INSERT INTO public.categories (id, name, slug, created_at, updated_at)
SELECT gen_random_uuid(), 'Desenvolvimento Pessoal', 'desenvolvimento-pessoal', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'desenvolvimento-pessoal');

-- ============================================
-- PARTE 3: ADICIONAR CONSTRAINT EM DONATIONS (se não existir)
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'donations_title_key' 
    AND conrelid = 'public.donations'::regclass
  ) THEN
    ALTER TABLE public.donations ADD CONSTRAINT donations_title_key UNIQUE (title);
  END IF;
END $$;

-- ============================================
-- PARTE 4: CRIAR DOAÇÕES
-- ============================================
INSERT INTO public.donations (id, title, description, detail, reference, created_at, updated_at)
SELECT gen_random_uuid(), 'M-Pesa', 'Conta empresarial', '84 123 4567', 'Jovem c/ Propósito', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM public.donations WHERE title = 'M-Pesa');

INSERT INTO public.donations (id, title, description, detail, reference, created_at, updated_at)
SELECT gen_random_uuid(), 'e-Mola', 'Conta pessoal', '86 987 6543', 'JCP Ministry', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM public.donations WHERE title = 'e-Mola');

INSERT INTO public.donations (id, title, description, detail, reference, created_at, updated_at)
SELECT gen_random_uuid(), 'Conta Bancária', 'BCI - NIB', '0002 0034 0000 1234 567 89', 'IBAN: MZ59 0002 0034 0000 1234 56789', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM public.donations WHERE title = 'Conta Bancária');

INSERT INTO public.donations (id, title, description, detail, reference, created_at, updated_at)
SELECT gen_random_uuid(), 'Visa / Mastercard', 'Gateway internacional', 'Disponível sob demanda', 'Solicite link seguro', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM public.donations WHERE title = 'Visa / Mastercard');

-- ============================================
-- PARTE 5: VERIFICAÇÃO FINAL
-- ============================================
-- Verificar admin
SELECT 
  'ADMIN' as tipo,
  p.id::text as id,
  p.full_name as nome,
  u.email as email,
  p.role as role
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'Sunyldjosesomailamatapa@gmail.com'

UNION ALL

-- Contar categorias
SELECT 
  'CATEGORIAS' as tipo,
  COUNT(*)::text as id,
  'Total criadas' as nome,
  '' as email,
  '' as role
FROM public.categories

UNION ALL

-- Contar doações
SELECT 
  'DOAÇÕES' as tipo,
  COUNT(*)::text as id,
  'Total criadas' as nome,
  '' as email,
  '' as role
FROM public.donations;

-- ============================================
-- RESUMO
-- ============================================
SELECT 
  '✅ Seed completo executado!' as status,
  (SELECT COUNT(*) FROM public.categories) as categorias,
  (SELECT COUNT(*) FROM public.donations) as doacoes,
  (SELECT COUNT(*) FROM public.profiles WHERE role = 'admin') as admins;
