# Configuração de Variáveis de Ambiente

## Arquivo `.env.local`

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```env
# Supabase Configuration
# Obtenha esses valores em: https://app.supabase.com/project/_/settings/api

VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Como obter as credenciais

1. Acesse o [Supabase Dashboard](https://app.supabase.com)
2. Selecione seu projeto
3. Vá em **Settings** > **API**
4. Copie:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

## Configuração do Google OAuth

1. No Supabase Dashboard, vá em **Authentication** > **Providers**
2. Habilite o provider **Google**
3. Configure:
   - **Client ID** (do Google Cloud Console)
   - **Client Secret** (do Google Cloud Console)
4. Adicione as URLs de redirect:
   - `http://localhost:5173/verify-email` (desenvolvimento)
   - `https://seu-dominio.com/verify-email` (produção)

## Desenvolvimento Local (Opcional)

Se estiver usando Supabase CLI localmente:

```env
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=your-local-anon-key
```

## Segurança

⚠️ **IMPORTANTE:**
- Nunca commite o arquivo `.env.local` no Git
- O arquivo já está no `.gitignore`
- Use `.env.example` apenas como template (sem valores reais)

