# Como Criar Usuário Administrador

## 🚀 Método 1: Script SQL Direto (Recomendado)

Execute o script `006_create_admin_user_direct.sql` no Supabase SQL Editor.

Este script:
- ✅ Cria o usuário diretamente na tabela `auth.users`
- ✅ Cria o perfil na tabela `profiles` com role `admin`
- ✅ Usa senha criptografada com bcrypt
- ✅ Confirma o email automaticamente

**Credenciais:**
- Email: `Sunyldjosesomailamatapa@gmail.com`
- Senha: `123456`

## 🔄 Método 2: Via Função (Alternativa)

Se o Método 1 não funcionar (devido a restrições de segurança), execute:
`007_create_admin_via_api.sql`

## 📋 Método 3: Manual (Se os scripts não funcionarem)

1. **Supabase Dashboard** → **Authentication** → **Users**
2. Clique em **Add User** → **Create new user**
3. Preencha:
   - **Email**: `Sunyldjosesomailamatapa@gmail.com`
   - **Password**: `123456`
   - **Auto Confirm User**: ✅
4. Clique em **Create User**
5. Execute `004_create_admin_user.sql` para configurar o perfil como admin

## ✅ Verificar

Após executar qualquer método, verifique:

```sql
SELECT 
  p.id,
  p.full_name,
  u.email,
  p.role,
  p.is_mentor_approved
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'Sunyldjosesomailamatapa@gmail.com';
```

O resultado deve mostrar `role = 'admin'`.

## 🔐 Fazer Login

1. Acesse a aplicação
2. Faça login com:
   - Email: `Sunyldjosesomailamatapa@gmail.com`
   - Senha: `123456`
3. Você será redirecionado para `/dashboard/admin`






