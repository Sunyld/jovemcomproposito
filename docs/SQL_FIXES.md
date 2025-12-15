# Correções dos Scripts SQL

## Problemas Corrigidos

### 1. Triggers e Policies Duplicados
**Problema:** Erros ao executar scripts quando já existiam triggers/policies.

**Solução:** Adicionado `DROP IF EXISTS` antes de criar triggers e policies em:
- `001_initial_schema.sql` - Triggers
- `002_rls_policies.sql` - Todas as policies RLS
- `003_storage_buckets.sql` - Policies de storage

### 2. ON CONFLICT sem Constraint
**Problema:** `ON CONFLICT` não funcionava porque não havia constraint de unicidade.

**Solução:** 
- Adicionado `UNIQUE` constraint em `donations.title` na migration `001_initial_schema.sql`
- Criada migration `004_add_unique_constraints.sql` para adicionar constraint se não existir
- Scripts de seed agora usam `WHERE NOT EXISTS` ao invés de `ON CONFLICT`

### 3. Coluna email não existe em profiles
**Problema:** Scripts tentavam usar `p.email` mas a tabela `profiles` não tem essa coluna.

**Solução:**
- Removidas referências a `p.email` nos scripts
- Usar `u.email` de `auth.users` quando necessário
- Corrigido `useAuth.tsx` para não tentar inserir email no profile
- Atualizado `types.ts` para remover email do tipo Profile

## Scripts Corrigidos

✅ `001_initial_schema.sql` - Triggers com DROP IF EXISTS
✅ `002_rls_policies.sql` - Todas policies com DROP IF EXISTS  
✅ `003_storage_buckets.sql` - Policies com DROP IF EXISTS
✅ `000_complete_seed.sql` - Usa WHERE NOT EXISTS
✅ `001_create_users_and_profiles.sql` - Removido p.email
✅ `002_create_categories_and_donations.sql` - Usa WHERE NOT EXISTS
✅ `seed.sql` - Usa WHERE NOT EXISTS

## Ordem de Execução Recomendada

1. **001_initial_schema.sql** - Cria tabelas e triggers
2. **004_add_unique_constraints.sql** - Adiciona constraints (opcional, já está no schema)
3. **002_rls_policies.sql** - Cria policies RLS
4. **003_storage_buckets.sql** - Cria buckets e policies de storage
5. **000_complete_seed.sql** - Popula dados iniciais (após criar usuário admin no Dashboard)

## Verificações

Após executar os scripts, verifique:

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

-- Verificar constraints
SELECT conname, contype 
FROM pg_constraint 
WHERE conrelid = 'public.donations'::regclass;
```






