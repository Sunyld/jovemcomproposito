# Como Corrigir Emails Duplicados

## ⚠️ Problema

Você tem emails duplicados no banco (mesmo email com maiúsculas/minúsculas diferentes):
- `Sunyldjosesomailamatapa@gmail.com`
- `sunyldjosesomailamatapa@gmail.com`

## ✅ Solução

Execute os scripts SQL **nesta ordem** no Supabase SQL Editor:

### 1. Primeiro: Remover Duplicatas e Normalizar
Execute `008_normalize_emails.sql`

Este script:
- Identifica emails duplicados (case-insensitive)
- Mantém apenas o usuário mais antigo de cada grupo
- Remove usuários duplicados e seus perfis
- Normaliza todos os emails restantes para lowercase

### 2. Depois: Criar Função de Verificação
Execute `009_create_email_check_function.sql`

Este script cria a função `check_user_by_email()` que verifica se um email existe (case-insensitive).

### 3. Opcional: Função de Normalização
Execute `010_normalize_email_trigger.sql`

Este script cria a função `normalize_all_emails()` que pode ser executada manualmente quando necessário.

## 🔍 Verificar Resultado

Após executar os scripts, verifique:

```sql
-- Verificar se ainda há duplicatas (não deveria ter)
SELECT 
  LOWER(TRIM(email)) as normalized_email,
  COUNT(*) as count,
  array_agg(id) as user_ids
FROM auth.users
GROUP BY LOWER(TRIM(email))
HAVING COUNT(*) > 1;

-- Se retornar vazio, está tudo OK!
```

## 📝 Nota Importante

O script `008_normalize_emails.sql` **remove** usuários duplicados, mantendo apenas o mais antigo. Se você quiser manter um usuário específico ao invés do mais antigo, edite o script antes de executar.

## 🚀 Depois de Executar

Após executar os scripts:
1. Todos os emails estarão normalizados (lowercase)
2. Não haverá mais duplicatas
3. OAuth não criará perfis duplicados
4. Login funcionará independente de maiúsculas/minúsculas





