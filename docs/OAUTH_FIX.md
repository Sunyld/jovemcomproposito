# Correção do Erro OAuth

## Erro: `bad_oauth_state`

Este erro geralmente ocorre quando a URL de callback não está configurada corretamente no Supabase ou Google Cloud Console.

## Solução

### 1. Configurar no Supabase Dashboard

1. Acesse **Supabase Dashboard** → **Authentication** → **URL Configuration**
2. Adicione as seguintes URLs em **Redirect URLs**:
   - `http://localhost:3000/oauth/callback` (desenvolvimento)
   - `http://localhost:5173/oauth/callback` (se usar Vite)
   - `https://seu-dominio.com/oauth/callback` (produção)

### 2. Configurar no Google Cloud Console

1. Acesse [Google Cloud Console](https://console.cloud.google.com)
2. Vá em **APIs & Services** → **Credentials**
3. Selecione seu OAuth 2.0 Client ID
4. Em **Authorized redirect URIs**, adicione:
   - `https://[seu-projeto].supabase.co/auth/v1/callback`
   - (O Supabase gerencia o callback interno)

### 3. Verificar Variáveis de Ambiente

Certifique-se de que `.env.local` está configurado:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon
```

### 4. Limpar Cache e Cookies

Se o erro persistir:
1. Limpe os cookies do navegador
2. Limpe o cache do localStorage
3. Tente fazer login novamente

## Fluxo de OAuth Corrigido

1. Usuário clica em "Entrar com Google"
2. Redireciona para Google
3. Google redireciona para Supabase
4. Supabase redireciona para `/oauth/callback`
5. OAuthCallback verifica o perfil e redireciona baseado no role:
   - `admin` → `/dashboard/admin`
   - `mentor` → `/dashboard/mentor`
   - `user` → `/dashboard/user`

## Notas

- Se o usuário não tem perfil, ele é criado automaticamente como `user`
- Se o usuário já tem um role (admin/mentor), ele vai para o dashboard correto
- Usuários normais podem se cadastrar via Google OAuth sem precisar de admin





