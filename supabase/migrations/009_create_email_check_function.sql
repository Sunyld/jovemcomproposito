-- ============================================
-- FUNÇÃO PARA VERIFICAR USUÁRIO POR EMAIL (CASE-INSENSITIVE)
-- ============================================
-- Esta função permite verificar se um email já existe no banco
-- Execute no Supabase SQL Editor

CREATE OR REPLACE FUNCTION public.check_user_by_email(email_param TEXT)
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  email_exists BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id as user_id,
    u.email,
    TRUE as email_exists
  FROM auth.users u
  WHERE LOWER(TRIM(u.email)) = LOWER(TRIM(email_param))
  LIMIT 1;
  
  -- Se não encontrou, retorna email_exists = false
  IF NOT FOUND THEN
    RETURN QUERY SELECT NULL::UUID, email_param, FALSE;
  END IF;
END;
$$;

-- Dar permissão para authenticated users
GRANT EXECUTE ON FUNCTION public.check_user_by_email(TEXT) TO authenticated;

-- Testar a função (descomente para testar)
-- SELECT * FROM public.check_user_by_email('Sunyldjosesomailamatapa@gmail.com');
-- SELECT * FROM public.check_user_by_email('sunyldjosesomailamatapa@gmail.com');

