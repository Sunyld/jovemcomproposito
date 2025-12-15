-- ============================================
-- NORMALIZAR EMAILS NO BANCO DE DADOS
-- ============================================
-- Este script normaliza todos os emails para lowercase
-- E remove duplicatas (case-insensitive)
-- Execute no Supabase SQL Editor

-- PASSO 1: Identificar emails duplicados (case-insensitive)
-- Manter apenas o usuário mais antigo de cada grupo
DO $$
DECLARE
  dup_record RECORD;
  keep_user_id UUID;
  delete_user_ids UUID[];
BEGIN
  -- Para cada grupo de emails duplicados (case-insensitive)
  FOR dup_record IN
    SELECT 
      LOWER(TRIM(email)) as normalized_email,
      array_agg(id ORDER BY created_at ASC) as user_ids,
      COUNT(*) as count
    FROM auth.users
    GROUP BY LOWER(TRIM(email))
    HAVING COUNT(*) > 1
  LOOP
    -- Manter o primeiro (mais antigo), deletar os outros
    keep_user_id := dup_record.user_ids[1];
    delete_user_ids := array_remove(dup_record.user_ids, keep_user_id);
    
    -- Deletar perfis dos usuários duplicados
    DELETE FROM public.profiles
    WHERE id = ANY(delete_user_ids);
    
    -- Deletar usuários duplicados (manter apenas o mais antigo)
    DELETE FROM auth.users
    WHERE id = ANY(delete_user_ids);
    
    RAISE NOTICE 'Mantido: %, Removidos: %', keep_user_id, delete_user_ids;
  END LOOP;
END $$;

-- PASSO 2: Normalizar todos os emails restantes
UPDATE auth.users
SET email = LOWER(TRIM(email))
WHERE email != LOWER(TRIM(email));

-- Verificar emails normalizados
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

-- Verificar se ainda há emails duplicados (não deveria ter)
SELECT 
  LOWER(TRIM(email)) as normalized_email,
  COUNT(*) as count,
  array_agg(id) as user_ids
FROM auth.users
GROUP BY LOWER(TRIM(email))
HAVING COUNT(*) > 1;

