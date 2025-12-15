# Setup Completo - Jovem com Propósito

## ✅ Scripts SQL Corrigidos

Todos os scripts foram corrigidos e estão prontos para uso:

### Migrations (Execute na ordem)
1. **001_initial_schema.sql** ✅
   - Cria todas as tabelas
   - Triggers com `DROP IF EXISTS` (pode executar múltiplas vezes)
   - Constraint `UNIQUE` em `donations.title`

2. **002_rls_policies.sql** ✅
   - Todas as policies RLS com `DROP IF EXISTS`
   - Pode executar múltiplas vezes sem erro

3. **003_storage_buckets.sql** ✅
   - Buckets de storage
   - Policies com `DROP IF EXISTS`

4. **004_add_unique_constraints.sql** ✅ (Opcional)
   - Adiciona constraint se não existir

### Seeds (Execute após criar usuário admin)
1. **000_complete_seed.sql** ✅ (Recomendado)
   - Script completo: admin + categorias + doações
   - Usa `WHERE NOT EXISTS` ao invés de `ON CONFLICT`
   - Pode executar múltiplas vezes

2. **001_create_users_and_profiles.sql** ✅
   - Configura usuário admin
   - Removido referências a `p.email`

3. **002_create_categories_and_donations.sql** ✅
   - Usa `WHERE NOT EXISTS`

4. **003_create_mentorias_example.sql** ✅
   - Exemplos de mentorias (requer mentores)

## 🔧 Correções Aplicadas

### 1. Triggers e Policies
- ✅ Adicionado `DROP IF EXISTS` em todos os triggers
- ✅ Adicionado `DROP IF EXISTS` em todas as policies
- ✅ Scripts podem ser executados múltiplas vezes

### 2. Constraints
- ✅ Adicionado `UNIQUE` em `donations.title`
- ✅ Scripts de seed usam `WHERE NOT EXISTS`

### 3. Coluna Email
- ✅ Removido `email` do tipo `Profile`
- ✅ Removido tentativas de inserir `email` em profiles
- ✅ Corrigido `OAuthCallback.tsx`
- ✅ Corrigido `MentorInscricoes.tsx` (mostra ID ao invés de email)

### 4. Cores
- ✅ Todas as páginas do Dashboard corrigidas
- ✅ Sistema de temas funcionando

## 📋 Ordem de Execução

### Passo 1: Executar Migrations
```sql
-- Execute no Supabase SQL Editor na ordem:
1. 001_initial_schema.sql
2. 002_rls_policies.sql  
3. 003_storage_buckets.sql
4. 004_add_unique_constraints.sql (opcional)
```

### Passo 2: Criar Usuário Admin
1. Supabase Dashboard → Authentication → Users
2. Add User → Create new user
3. Email: `Sunyldjosesomailamatapa@gmail.com`
4. Password: `123456`
5. Auto Confirm User: ✅
6. Create User

### Passo 3: Executar Seed
```sql
-- Execute no Supabase SQL Editor:
000_complete_seed.sql
```

### Passo 4: Verificar
```sql
-- Verificar admin
SELECT p.id, p.full_name, p.role, u.email 
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'Sunyldjosesomailamatapa@gmail.com';

-- Verificar categorias
SELECT COUNT(*) FROM public.categories;

-- Verificar doações
SELECT COUNT(*) FROM public.donations;
```

## 🚀 Sistema Pronto

Após executar os scripts:
- ✅ Banco de dados configurado
- ✅ RLS policies ativas
- ✅ Storage buckets criados
- ✅ Usuário admin configurado
- ✅ Categorias e doações criadas
- ✅ CRUD funcionando em todas as telas
- ✅ Sistema de temas (light/dark) funcionando

## 📝 Notas

- O email não está na tabela `profiles`, está apenas em `auth.users`
- Para obter email, faça JOIN com `auth.users` ou use `user.email` do hook `useAuth`
- Todos os scripts podem ser executados múltiplas vezes sem erro






