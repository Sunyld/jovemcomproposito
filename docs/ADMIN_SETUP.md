# Configuração de Administrador

## Passo a passo para criar usuário administrador

### 1. Criar usuário no Supabase Auth

1. Acesse o [Supabase Dashboard](https://app.supabase.com)
2. Vá em **Authentication** > **Users**
3. Clique em **Add User** > **Create new user**
4. Preencha:
   - **Email**: `Sunyldjosesomailamatapa@gmail.com`
   - **Password**: `123456`
   - **Auto Confirm User**: ✅ (marque esta opção)
5. Clique em **Create User**

### 2. Executar script SQL completo

**Opção A: Script Completo (Recomendado)**
1. No Supabase Dashboard, vá em **SQL Editor**
2. Abra o arquivo `supabase/seeds/000_complete_seed.sql`
3. Cole o conteúdo no editor SQL
4. Clique em **Run** para executar
5. Este script cria: admin, categorias e doações de uma vez

**Opção B: Scripts Individuais**
1. Execute `supabase/seeds/001_create_users_and_profiles.sql` (após criar usuário)
2. Execute `supabase/seeds/002_create_categories_and_donations.sql`
3. Execute `supabase/seeds/003_create_mentorias_example.sql` (opcional, requer mentores)

### 3. Verificar

Após executar o script, você pode verificar se o usuário foi criado corretamente:

```sql
SELECT 
  p.id,
  p.full_name,
  p.email,
  p.role,
  p.is_mentor_approved
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'Sunyldjosesomailamatapa@gmail.com';
```

O resultado deve mostrar `role = 'admin'`.

### 4. Fazer login

1. Acesse a aplicação
2. Faça login com:
   - **Email**: `Sunyldjosesomailamatapa@gmail.com`
   - **Senha**: `123456`
3. Você será redirecionado para `/dashboard/admin`

## Configuração do Google OAuth

Para o login com Google funcionar, você precisa:

1. No Supabase Dashboard, vá em **Authentication** > **Providers**
2. Ative o **Google** provider
3. Configure:
   - **Client ID**: (obtenha no Google Cloud Console)
   - **Client Secret**: (obtenha no Google Cloud Console)
4. Adicione os redirect URLs:
   - `http://localhost:5173/oauth/callback` (desenvolvimento)
   - `https://seu-dominio.com/oauth/callback` (produção)

### Como obter credenciais do Google

1. Acesse [Google Cloud Console](https://console.cloud.google.com)
2. Crie um novo projeto ou selecione um existente
3. Vá em **APIs & Services** > **Credentials**
4. Clique em **Create Credentials** > **OAuth client ID**
5. Configure:
   - **Application type**: Web application
   - **Name**: Jovem com Propósito
   - **Authorized redirect URIs**: 
     - `https://[seu-projeto].supabase.co/auth/v1/callback`
     - `http://localhost:5173/oauth/callback` (dev)
6. Copie o **Client ID** e **Client Secret** para o Supabase

