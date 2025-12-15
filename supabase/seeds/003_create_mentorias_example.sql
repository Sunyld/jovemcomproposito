-- Script para criar mentorias de exemplo
-- Execute este script APÓS criar usuários mentores
-- 
-- IMPORTANTE: Substitua os <MENTOR_ID> pelos IDs reais de mentores
-- Para obter IDs de mentores, execute:
-- SELECT id, full_name, email FROM public.profiles WHERE role = 'mentor';

-- ============================================
-- MENTORIAS DE EXEMPLO
-- ============================================

-- Exemplo 1: Mentoria de Carreira (Grátis)
INSERT INTO public.mentorias (
  mentor_id, 
  title, 
  description, 
  cover_url, 
  category_id, 
  type, 
  price, 
  currency, 
  external_link, 
  published,
  created_at,
  updated_at
)
SELECT 
  (SELECT id FROM public.profiles WHERE role = 'mentor' LIMIT 1), -- Substitua por ID real
  'Mentoria Carreira Next Level',
  'Plano personalizado para acelerar sua carreira com checkpoints quinzenais. Inclui análise de perfil profissional, definição de objetivos, estratégias de networking e desenvolvimento de habilidades essenciais.',
  NULL,
  (SELECT id FROM public.categories WHERE slug = 'mentoria-carreira' LIMIT 1),
  'online',
  0,
  'MZN',
  'https://meet.google.com/example',
  true,
  now(),
  now()
WHERE EXISTS (SELECT 1 FROM public.profiles WHERE role = 'mentor')
ON CONFLICT DO NOTHING;

-- Exemplo 2: Comunicação Autêntica (Paga)
INSERT INTO public.mentorias (
  mentor_id, 
  title, 
  description, 
  cover_url, 
  category_id, 
  type, 
  price, 
  currency, 
  external_link, 
  published,
  created_at,
  updated_at
)
SELECT 
  (SELECT id FROM public.profiles WHERE role = 'mentor' LIMIT 1), -- Substitua por ID real
  'Comunicação Autêntica',
  'Workshop em 4 encontros para aprimorar oratória e storytelling. Aprenda técnicas de apresentação, construção de narrativas impactantes e comunicação não-verbal.',
  NULL,
  (SELECT id FROM public.categories WHERE slug = 'comunicacao-soft-skills' LIMIT 1),
  'online',
  1500,
  'MZN',
  NULL,
  true,
  now(),
  now()
WHERE EXISTS (SELECT 1 FROM public.profiles WHERE role = 'mentor')
ON CONFLICT DO NOTHING;

-- Exemplo 3: Laboratório de Projetos Tech (Grátis - Rascunho)
INSERT INTO public.mentorias (
  mentor_id, 
  title, 
  description, 
  cover_url, 
  category_id, 
  type, 
  price, 
  currency, 
  external_link, 
  published,
  created_at,
  updated_at
)
SELECT 
  (SELECT id FROM public.profiles WHERE role = 'mentor' LIMIT 1), -- Substitua por ID real
  'Laboratório de Projetos Tech',
  'Mentorias em grupo com foco em prototipação e pitch. Desenvolva projetos reais, aprenda metodologias ágeis e apresente suas ideias para investidores.',
  NULL,
  (SELECT id FROM public.categories WHERE slug = 'ciencia-tecnologia' LIMIT 1),
  'online',
  0,
  'MZN',
  NULL,
  false,
  now(),
  now()
WHERE EXISTS (SELECT 1 FROM public.profiles WHERE role = 'mentor')
ON CONFLICT DO NOTHING;

-- Exemplo 4: Finanças Pessoais (Paga)
INSERT INTO public.mentorias (
  mentor_id, 
  title, 
  description, 
  cover_url, 
  category_id, 
  type, 
  price, 
  currency, 
  external_link, 
  published,
  created_at,
  updated_at
)
SELECT 
  (SELECT id FROM public.profiles WHERE role = 'mentor' LIMIT 1), -- Substitua por ID real
  'Finanças Pessoais e Investimentos',
  'Aprenda a gerenciar suas finanças, criar orçamentos, eliminar dívidas e começar a investir. Inclui planilhas e ferramentas práticas.',
  NULL,
  (SELECT id FROM public.categories WHERE slug = 'financas-empreendedorismo' LIMIT 1),
  'online',
  2000,
  'MZN',
  NULL,
  true,
  now(),
  now()
WHERE EXISTS (SELECT 1 FROM public.profiles WHERE role = 'mentor')
ON CONFLICT DO NOTHING;

-- ============================================
-- VERIFICAÇÃO
-- ============================================
-- Verificar mentorias criadas
SELECT 
  m.id,
  m.title,
  m.type,
  m.price,
  m.currency,
  m.published,
  p.full_name as mentor_name,
  c.name as category_name
FROM public.mentorias m
LEFT JOIN public.profiles p ON m.mentor_id = p.id
LEFT JOIN public.categories c ON m.category_id = c.id
ORDER BY m.created_at DESC;

