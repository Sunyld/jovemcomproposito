-- ============================================
-- TRIGGER PARA NORMALIZAR EMAILS AUTOMATICAMENTE
-- ============================================
-- Este trigger garante que todos os emails sejam normalizados (lowercase)
-- Execute no Supabase SQL Editor

-- Função para normalizar email antes de inserir/atualizar
CREATE OR REPLACE FUNCTION public.normalize_user_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Normalizar email para lowercase e remover espaços
  IF NEW.email IS NOT NULL THEN
    NEW.email = LOWER(TRIM(NEW.email));
  END IF;
  RETURN NEW;
END;
$$;

-- Criar trigger na tabela auth.users (se possível)
-- Nota: Pode não funcionar diretamente em auth.users devido a restrições
-- Mas podemos criar uma função que é chamada manualmente ou via webhook

-- Alternativa: Criar função para normalizar emails existentes
-- Esta função remove duplicatas antes de normalizar
CREATE OR REPLACE FUNCTION public.normalize_all_emails()
RETURNS TABLE (
  normalized_count INTEGER,
  duplicate_count INTEGER,
  removed_count INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  normalized INTEGER := 0;
  duplicates INTEGER := 0;
  removed INTEGER := 0;
  dup_record RECORD;
  keep_user_id UUID;
  delete_user_ids UUID[];
BEGIN
  -- PASSO 1: Remover duplicatas (manter apenas o mais antigo)
  FOR dup_record IN
    SELECT 
      LOWER(TRIM(email)) as normalized_email,
      array_agg(id ORDER BY created_at ASC) as user_ids,
      COUNT(*) as count
    FROM auth.users
    GROUP BY LOWER(TRIM(email))
    HAVING COUNT(*) > 1
  LOOP
    keep_user_id := dup_record.user_ids[1];
    delete_user_ids := array_remove(dup_record.user_ids, keep_user_id);
    
    -- Deletar perfis
    DELETE FROM public.profiles WHERE id = ANY(delete_user_ids);
    
    -- Deletar usuários
    DELETE FROM auth.users WHERE id = ANY(delete_user_ids);
    
    removed := removed + array_length(delete_user_ids, 1);
  END LOOP;
  
  -- PASSO 2: Normalizar todos os emails restantes
  UPDATE auth.users
  SET email = LOWER(TRIM(email))
  WHERE email != LOWER(TRIM(email));
  
  GET DIAGNOSTICS normalized = ROW_COUNT;
  
  -- Contar duplicatas restantes (não deveria ter)
  SELECT COUNT(*) INTO duplicates
  FROM (
    SELECT LOWER(TRIM(email)) as normalized_email
    FROM auth.users
    GROUP BY LOWER(TRIM(email))
    HAVING COUNT(*) > 1
  ) dup_check;
  
  RETURN QUERY SELECT normalized, duplicates, removed;
END;
$$;

-- Executar normalização (só se necessário)
-- SELECT * FROM public.normalize_all_emails();

-- Verificar resultado
SELECT 
  id,
  email,
  LOWER(TRIM(email)) as normalized,
  CASE WHEN email = LOWER(TRIM(email)) THEN 'OK' ELSE 'PRECISA NORMALIZAR' END as status
FROM auth.users
ORDER BY created_at DESC
LIMIT 20;

