# Normalização de Emails

## Problema Resolvido

Emails são case-insensitive (não diferenciam maiúsculas/minúsculas), mas o sistema estava tratando `Sunyldjosesomailamatapa@gmail.com` e `sunyldjosesomailamatapa@gmail.com` como emails diferentes, criando perfis duplicados.

## Solução Implementada

### 1. Função de Normalização
Criada função `normalizeEmail()` em `src/lib/emailUtils.ts` que:
- Remove espaços em branco
- Converte para lowercase
- Usada em todos os lugares onde emails são processados

### 2. Normalização em Todo o Sistema
- ✅ Login: email normalizado antes de autenticar
- ✅ Signup: email normalizado antes de criar conta
- ✅ OAuth: email normalizado antes de verificar/criar perfil
- ✅ AdminAdmins: email normalizado ao criar admin
- ✅ AdminMentores: email normalizado ao criar mentor
- ✅ ForgotPassword: email normalizado ao resetar senha

### 3. Função SQL para Verificar Email
Criada função `check_user_by_email()` que verifica se email existe (case-insensitive):
```sql
SELECT * FROM public.check_user_by_email('Sunyldjosesomailamatapa@gmail.com');
```

### 4. Script para Normalizar Emails Existentes
Execute `supabase/migrations/008_normalize_emails.sql` para normalizar todos os emails já cadastrados no banco.

## Como Usar

### Normalizar Emails Existentes
Execute no Supabase SQL Editor:
```sql
-- Script 008_normalize_emails.sql
```

### Verificar Emails Duplicados
```sql
SELECT 
  LOWER(TRIM(email)) as normalized_email,
  COUNT(*) as count,
  array_agg(id) as user_ids
FROM auth.users
GROUP BY LOWER(TRIM(email))
HAVING COUNT(*) > 1;
```

## Importante

- Todos os novos emails são automaticamente normalizados
- OAuth agora verifica se email já existe antes de criar perfil
- Se email já existe, usa o perfil existente ao invés de criar novo





