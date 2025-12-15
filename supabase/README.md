# Scripts SQL - Jovem com Propósito

## 📋 Ordem de Execução

Execute os scripts na ordem abaixo no Supabase SQL Editor:

### 1. Migrations (Execute primeiro)

1. **001_initial_schema.sql**
   - Cria todas as tabelas
   - Cria triggers
   - ✅ Pode executar múltiplas vezes

2. **002_rls_policies.sql**
   - Cria todas as policies RLS
   - ✅ Pode executar múltiplas vezes

3. **003_storage_buckets.sql**
   - Cria buckets de storage
   - Cria policies de storage
   - ✅ Pode executar múltiplas vezes

4. **004_add_unique_constraints.sql**
   - Adiciona constraint unique em donations.title
   - ✅ Pode executar múltiplas vezes

### 2. Criar Usuário Admin

**Opção A: Script SQL (Recomendado)**
- Execute **006_create_admin_user_direct.sql**
- Cria usuário e perfil automaticamente

**Opção B: Manual**
1. Dashboard → Authentication → Users → Add User
2. Email: `Sunyldjosesomailamatapa@gmail.com`
3. Password: `123456`
4. ✅ Auto Confirm User
5. Execute **006_create_admin_user_direct.sql** (só atualiza o perfil)

### 3. Seed (Execute depois de criar admin)

**000_complete_seed.sql**
- Cria categorias
- Cria doações
- Configura perfil admin (se já existir)
- ✅ Pode executar múltiplas vezes

**003_create_mentorias_example.sql** (Opcional)
- Cria mentorias de exemplo
- Requer mentores criados

## ✅ Verificação

Após executar todos os scripts:

```sql
-- Verificar admin
SELECT p.id, p.full_name, u.email, p.role 
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'Sunyldjosesomailamatapa@gmail.com';

-- Verificar categorias
SELECT COUNT(*) FROM public.categories;

-- Verificar doações
SELECT COUNT(*) FROM public.donations;
```

## 🚀 Pronto!

Agora você pode fazer login com:
- Email: `Sunyldjosesomailamatapa@gmail.com`
- Senha: `123456`






