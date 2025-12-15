# 🚀 Guia Rápido - Executar Scripts SQL

## Ordem de Execução (Copie e cole no Supabase SQL Editor)

### PASSO 1: Migrations (Execute na ordem)

```sql
-- 1. Schema inicial
-- Copie e cole o conteúdo de: 001_initial_schema.sql
```

```sql
-- 2. Policies RLS
-- Copie e cole o conteúdo de: 002_rls_policies.sql
```

```sql
-- 3. Storage buckets
-- Copie e cole o conteúdo de: 003_storage_buckets.sql
```

```sql
-- 4. Constraints (opcional, já está no schema)
-- Copie e cole o conteúdo de: 004_add_unique_constraints.sql
```

### PASSO 2: Criar Usuário Admin

```sql
-- 5. Criar admin
-- Copie e cole o conteúdo de: 006_create_admin_user_direct.sql
```

### PASSO 3: Seed (Dados iniciais)

```sql
-- 6. Seed completo
-- Copie e cole o conteúdo de: seeds/000_complete_seed.sql
```

## ✅ Verificar

```sql
-- Verificar se tudo foi criado
SELECT 
  'Admin' as tipo,
  p.full_name as nome,
  u.email as email,
  p.role as role
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'Sunyldjosesomailamatapa@gmail.com'

UNION ALL

SELECT 
  'Categorias' as tipo,
  COUNT(*)::text as nome,
  '' as email,
  '' as role
FROM public.categories

UNION ALL

SELECT 
  'Doações' as tipo,
  COUNT(*)::text as nome,
  '' as email,
  '' as role
FROM public.donations;
```

## 🎯 Pronto!

Faça login com:
- **Email**: `Sunyldjosesomailamatapa@gmail.com`
- **Senha**: `123456`





