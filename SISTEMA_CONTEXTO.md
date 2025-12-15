# Contexto do Sistema - Jovem com Propósito

## O que o sistema faz
- Plataforma para discipulado, mentorias, projetos e devocionais.
- Dashboards por papel (admin, mentor, user) com gestão de conteúdos, inscrições, feedback e notificações.
- Páginas públicas para divulgação (landing, mentorias, projetos, doação, devocional).

## Como faz (arquitetura e stack)
- Frontend React + TypeScript + Vite.
- Supabase: Auth, Postgres (RLS), Storage, Realtime.
- Estilização com TailwindCSS + design tokens locais.
- Camada de dados: hooks dedicados + React Query para cache, revalidação e persistência (localStorage).
- Contextos: Auth, Theme, Devocional.

### Fluxos principais
- Mentorias: CRUD (admin/mentor), inscrição de usuários, aprovação/reprovação, download de materiais.
- Devocionais: séries de 7 dias ou instantâneos (24h); apenas um ativo; publicação desativa anteriores; notificações automáticas.
- Projetos: CRUD, inscrição e acompanhamento.
- Notificações: triggers Supabase + realtime no client; badge dinâmico no sidebar.
- Doações: listagem configurável; copiar detalhes; edição no dashboard.

## Por que faz assim (decisões)
- Supabase fornece auth + DB + realtime com baixo acoplamento.
- React Query para cache inteligente, revalidação em background e persistência, reduzindo refetch e melhorando UX.
- Componentes base (Button, Input, Card, Table, Modal) para consistência visual e acessibilidade.
- Devocional com lógica de serviço (server + client) garantindo unicidade e expiração automática por timestamp.

## Padrões e convenções
- Query keys nomeadas por recurso (ex.: `['mentorias', filters]`, `['devocional', 'active']`).
- Cache policies: alto (categorias, mentorias públicas), médio (dashboards, inscrições), curto (notificações, devocional do dia).
- Erros padronizados via `toast`.
- Sem fetch direto em componentes: sempre via hooks.
- Tipagem forte (evitar `any`), helpers em `lib/`.

## Estrutura de dados (principal)
- `profiles`, `mentorias`, `inscritos`, `categories`, `feedback`, `notifications`, `donations`, `devocional_series`, `devocional_items`, `projetos`, `projeto_inscricoes`.
- Triggers: atualização de `updated_at`, notificações automáticas, desativação de devocionais ativos.

## Observações de operação
- Cron jobs externos necessários: limpeza de devocionais antigos e envio diário do devocional (7h GMT+3).
- Persistência do cache apenas para dados não sensíveis.
- Realtime ativo para notificações; considerar throttling se o volume crescer.


