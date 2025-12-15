-- Adicionar constraints de unicidade para evitar duplicatas
-- Execute este script se ainda não tiver executado

-- Adicionar constraint unique em donations.title se não existir
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

-- Verificar constraints existentes
SELECT 
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'public.donations'::regclass
ORDER BY conname;

