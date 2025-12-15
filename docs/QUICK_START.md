# Quick Start - Setup Rápido

## 🚀 Executar Scripts SQL (Ordem Correta)

### 1. Migrations (Execute primeiro)
No Supabase SQL Editor, execute na ordem:

```sql
-- 1. Schema inicial
001_initial_schema.sql

-- 2. Policies RLS
002_rls_policies.sql

-- 3. Storage buckets
003_storage_buckets.sql
```

### 2. Criar Usuário Admin
1. Dashboard → Authentication → Users → Add User
2. Email: `Sunyldjosesomailamatapa@gmail.com`
3. Password: `123456`
4. ✅ Auto Confirm User
5. Create User

### 3. Seed (Execute depois de criar usuário)
```sql
-- Script completo
000_complete_seed.sql
```

## ✅ Verificar

```sql
-- Admin criado?
SELECT p.id, p.full_name, p.role, u.email 
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'Sunyldjosesomailamatapa@gmail.com';

-- Categorias criadas?
SELECT COUNT(*) FROM public.categories;

-- Doações criadas?
SELECT COUNT(*) FROM public.donations;
```

## 🎯 Pronto!

Agora você pode:
- ✅ Fazer login como admin
- ✅ Criar categorias, mentorias, doações
- ✅ Gerenciar usuários e mentores
- ✅ Sistema funcionando com dados reais

