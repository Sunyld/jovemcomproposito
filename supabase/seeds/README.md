# Scripts de Seed - Jovem com Propósito

Este diretório contém scripts SQL para popular o banco de dados com dados iniciais.

## 📋 Ordem de Execução

Execute os scripts na seguinte ordem:

### 1. Criar Usuário Administrador
**Arquivo:** `001_create_users_and_profiles.sql`

**Passo a passo:**
1. Acesse o Supabase Dashboard → **Authentication** → **Users**
2. Clique em **Add User** → **Create new user**
3. Preencha:
   - **Email**: `Sunyldjosesomailamatapa@gmail.com`
   - **Password**: `123456`
   - **Auto Confirm User**: ✅ (marque esta opção)
4. Clique em **Create User**
5. Execute o script `001_create_users_and_profiles.sql` no SQL Editor

### 2. Criar Categorias e Doações
**Arquivo:** `002_create_categories_and_donations.sql`

Execute este script para criar:
- 6 categorias de mentorias
- 4 métodos de doação

### 3. Criar Mentorias (Opcional)
**Arquivo:** `003_create_mentorias_example.sql`

**⚠️ IMPORTANTE:** Este script requer que você tenha pelo menos um usuário com role 'mentor' criado.

**Para criar um mentor:**
1. Crie um usuário no Dashboard (Authentication > Users)
2. Execute no SQL Editor:
```sql
-- Substitua <USER_ID> pelo ID do usuário criado
UPDATE public.profiles
SET role = 'mentor', is_mentor_approved = true
WHERE id = '<USER_ID>';
```

3. Depois execute o script `003_create_mentorias_example.sql`

## 🔍 Verificações

Após executar cada script, você pode verificar os dados:

### Verificar Admin
```sql
SELECT 
  p.id,
  p.full_name,
  p.email,
  p.role,
  u.email as auth_email
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'Sunyldjosesomailamatapa@gmail.com';
```

### Verificar Categorias
```sql
SELECT id, name, slug FROM public.categories ORDER BY created_at;
```

### Verificar Doações
```sql
SELECT id, title, description, detail FROM public.donations ORDER BY created_at;
```

### Verificar Mentorias
```sql
SELECT 
  m.id,
  m.title,
  m.published,
  p.full_name as mentor_name,
  c.name as category_name
FROM public.mentorias m
LEFT JOIN public.profiles p ON m.mentor_id = p.id
LEFT JOIN public.categories c ON m.category_id = c.id;
```

## 📝 Notas Importantes

1. **Usuários no auth.users**: O Supabase não permite criar usuários diretamente via SQL por padrão. Você precisa criar manualmente no Dashboard ou usar a API.

2. **Perfis**: Os perfis são criados automaticamente pelo trigger `on_auth_user_created` quando um usuário é criado no auth.users.

3. **IDs**: Alguns scripts usam `gen_random_uuid()` para gerar IDs. Se precisar de IDs específicos, substitua antes de executar.

4. **Conflitos**: Os scripts usam `ON CONFLICT DO NOTHING` para evitar erros ao executar múltiplas vezes.

## 🚀 Script Completo (Tudo de uma vez)

Se preferir executar tudo de uma vez, você pode criar um arquivo combinado:

```sql
-- Execute na ordem:
-- 1. 001_create_users_and_profiles.sql (após criar usuário no Dashboard)
-- 2. 002_create_categories_and_donations.sql
-- 3. 003_create_mentorias_example.sql (após criar mentores)
```

## 🔐 Segurança

- Nunca commite senhas ou tokens em repositórios públicos
- Use variáveis de ambiente para dados sensíveis
- Revise os scripts antes de executar em produção






