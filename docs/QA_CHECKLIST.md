# Checklist de QA – Jovem com Propósito

## Acesso Geral
- [ ] Landing page abre sem erros (hero, zigzag, carrossel, seções Discipulado/Projetos/Doação).
- [ ] Navegação pelo header funciona em desktop e mobile.
- [ ] Login com usuário real (user, mentor, admin) valida redirecionamentos corretos.

## Usuário (role = user)
- [ ] Página `/dashboard/user` mostra cards e permite atualizar nome.
- [ ] `Minhas mentorias` e `Minhas inscrições` listam dados reais.
- [ ] Download de PDF gera URL assinada apenas para mentorias aprovadas.
- [ ] Feedback é criado/atualizado com sucesso.

## Mentor (role = mentor)
- [ ] `/dashboard/mentor` exibe estatísticas e lista de mentorias do mentor logado.
- [ ] Criar/editar mentoria salva no Supabase (cover/documentos opcionais).
- [ ] `/dashboard/mentor/inscricoes` mostra inscrições filtradas e atualiza status.
- [ ] `/dashboard/mentor/feedback` lista avaliações e carrega estados vazios corretamente.

## Admin
- [ ] `/dashboard/admin` mostra métricas e cartões principais.
- [ ] `/dashboard/admin/mentores`: promover usuário → mentor, aprovar/rejeitar, editar dados.
- [ ] `/dashboard/admin/categorias`: criar, renomear e remover categorias.
- [ ] `/dashboard/admin/metricas`: números refletem dados reais.
- [ ] `/dashboard/admin/usuarios`: alterar role (user/admin) exceto o próprio admin logado.
- [ ] `/dashboard/admin/doacoes`: editar entradas e salvar (verificar landing page atualizado).

## Notificações
- [ ] `/dashboard/notifications` lista notificações do usuário logado.
- [ ] Marcar como lida (individual e “marcar todas”) atualiza a tabela.
- [ ] Realtime: inserir notificação manualmente (SQL) aparece sem reload.

## Uploads / Storage
- [ ] Upload de capa/arquivos PDF funciona (ver bucket `covers` e `mentorias-docs`).
- [ ] Exclusão/substituição de arquivos limpa o campo adequado na mentoria.

## Integração / Infra
- [ ] `.env` com `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
- [ ] `npm run build` termina sem erros (ver chunk warning apenas informativo).
- [ ] Deploy em Vercel: build (`npm run build`) e output `dist/`.

Anote qualquer falha encontrada com passos para reproduzir e dados usados (user/mentor/admin) para facilitar correções.*** End Patch








