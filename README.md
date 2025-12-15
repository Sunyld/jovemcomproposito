# Jovem com Propósito — React + Vite + Tailwind + Supabase

Futurista, dark, acentos roxo/violeta. Frontend responsivo com UI/UX refinada.

## Stack
- React 18 + Vite + TypeScript
- TailwindCSS com design tokens e tema light/dark
- Supabase (Auth, Postgres, Storage, Realtime — pronto para conectar)
- React Router
- Framer Motion para animações sutis

## Rodar local
1. Instalar deps:
   ```bash
   npm install
   ```
2. Criar `.env` na raiz do projeto com:
   ```bash
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
   ```
3. Rodar:
   ```bash
   npm run dev
   ```

## Deploy
- Vercel/Netlify: configure as env vars (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`). Build command `npm run build`, output `dist`.

## Estrutura
- `src/components`: Header, Hero, Carousel, Cards, Modal, Toast, etc.
- `src/pages`: `/`, `/mentorias`, `/mentorias/:id`, `/login`, `/signup`, `/dashboard/*`
- `src/hooks`: `useAuth`, `useSupabaseClient`, `useMentorias`
- `src/lib`: `supabaseClient`, `mock`, `types`

## Supabase (RLS/SQL — esboço)
Inclua no Supabase SQL Editor:
```sql
-- profiles
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text default 'user' check (role in ('visitor','user','mentor','admin')),
  bio text,
  avatar_url text,
  is_mentor_approved boolean default false,
  created_at timestamp with time zone default now()
);

-- categories
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null
);

-- mentorias
create table if not exists mentorias (
  id uuid primary key default gen_random_uuid(),
  mentor_id uuid references profiles(id) not null,
  title text not null,
  description text not null,
  cover_url text,
  category_id uuid references categories(id),
  type text check (type in ('online','presencial','documento')) not null,
  price numeric not null default 0,
  currency text default 'MZN',
  external_link text,
  document_path text,
  published boolean default false,
  created_at timestamp with time zone default now()
);

-- inscritos
create table if not exists inscritos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) not null,
  mentoria_id uuid references mentorias(id) not null,
  message text,
  has_access boolean default false,
  payment_status text default 'pending' check (payment_status in ('pending','paid','failed')),
  created_at timestamp with time zone default now()
);

-- RLS
alter table profiles enable row level security;
alter table categories enable row level security;
alter table mentorias enable row level security;
alter table inscritos enable row level security;

-- policies (exemplos resumidos)
create policy "public profiles read own" on profiles
for select using (true);
create policy "update own profile" on profiles
for update using (auth.uid() = id);

create policy "public mentorias when published" on mentorias
for select using (published = true);

create policy "mentor/admin can insert mentorias" on mentorias
for insert with check (
  exists (select 1 from profiles p where p.id = auth.uid() and (p.role = 'admin' or (p.role = 'mentor' and p.is_mentor_approved = true)))
);

create policy "owner or admin update" on mentorias
for update using (mentor_id = auth.uid() or exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "inscritos insert by user" on inscritos
for insert with check (auth.uid() = user_id);
```

## QA Manual (checklist)
- [ ] `npm run dev` roda e home carrega com tema dark futurista
- [ ] Alternar tema claro/escuro no header funciona
- [ ] Header responsivo, menu hamburger funciona
- [ ] Landing: Hero principal + seções Visão/Missão/Valores em zig-zag
- [ ] Carrossel de mentores auto-scroll e pausa no hover
- [ ] `/mentorias` filtra por categoria/tipo/preço
- [ ] `/mentorias/:id` mostra detalhe e ação (Participar/Solicitar acesso); download mock
- [ ] `/login` e `/signup` funcionam com Supabase (quando env configurado)
- [ ] Dashboard mentor: listar e editar (mock) + upload Storage
- [ ] Admin: aprovar mentor (mock)
- [ ] Login com botão Google e modo demo exibem feedback

## Próximos passos
- Integração pagamentos (Stripe/M-Pesa) com webhooks
- Edge Function para gerar Signed URL com verificação de acesso
- Ratings/comentários e chat realtime
- App mobile (React Native) compartilhando Supabase


