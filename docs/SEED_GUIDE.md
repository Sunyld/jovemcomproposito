# Guia de Seeds – Supabase

Para visualizar o dashboard com dados reais, execute os seeds abaixo.

1. Abra o [Supabase Studio](https://app.supabase.com) → SQL Editor.
2. Cole o conteúdo de `supabase/seeds/seed.sql`.
3. Substitua `<MENTOR_ID_X>` pelos IDs reais (UUID) de mentores existentes (perfis presentes na tabela `profiles`/em `auth.users`).
4. Execute o script.

## Como obter IDs de mentores

```sql
select id, full_name, role
from public.profiles
where role = 'mentor';
```

Use o resultado para preencher os placeholders no seed de mentorias.

## Ajustando mentorias

- Para alterar categoria, atualize o `slug` usado no `select`.
- Para publicar/ocultar, ajuste o campo `published`.
- Para alterar preço/moeda, edite `price` e `currency`.

## Seeds adicionais

Caso deseje inserir mentorias específicas por idioma ou público:

```sql
insert into public.mentorias (mentor_id, title, description, category_id, type, price, currency, published)
values (
  '<MENTOR_ID>',
  'Mentoria de Pitch',
  'Quatro encontros focados em storytelling para captação.',
  (select id from categories where slug = 'comunicacao-soft-skills' limit 1),
  'online',
  0,
  'MZN',
  true
);
```

> Recomendado criar pelo menos 3 mentorias, 4 categorias e atualizar as doações para validar o front-end.

Após executar o seed, recarregue o app (`npm run dev` ou Vercel) para ver os dados atualizados.*** End Patch








