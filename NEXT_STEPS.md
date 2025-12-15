# 🚀 Próximos Passos - Guia de Implementação

Este documento fornece um guia passo a passo para continuar aplicando as melhorias de UI/UX no projeto.

---

## 📦 COMPONENTES BASE DISPONÍVEIS

Todos os componentes base estão criados e prontos para uso em `src/components/ui/`:

- ✅ `Button` - Botões com variantes e estados
- ✅ `Input` - Inputs com labels, erros e ícones
- ✅ `Select` - Selects estilizados e acessíveis
- ✅ `Textarea` - Textareas consistentes
- ✅ `Card` - Cards reutilizáveis
- ✅ `Table` - Tabelas acessíveis

**Importação:**
```tsx
import { Button, Input, Card, Table } from '../components/ui';
```

---

## 🎯 PRIORIDADE DE IMPLEMENTAÇÃO

### FASE 1: Páginas de Autenticação (Alta Prioridade)

#### ✅ Login (`src/pages/Login.tsx`)
- **Status:** ✅ Concluído
- Usando `Button` e `Input`

#### ⏳ Signup (`src/pages/Signup.tsx`)
- **Ações:**
  - Substituir inputs por componente `Input`
  - Substituir botões por componente `Button`
  - Melhorar espaçamentos
  - Adicionar validação visual

#### ⏳ ForgotPassword (`src/pages/ForgotPassword.tsx`)
- **Ações:**
  - Usar componente `Input`
  - Usar componente `Button`
  - Melhorar layout

#### ⏳ ResetPassword (`src/pages/ResetPassword.tsx`)
- **Ações:**
  - Usar componente `Input`
  - Usar componente `Button`
  - Melhorar feedback visual

---

### FASE 2: Dashboards (Alta Prioridade)

#### ⏳ Profile (`src/pages/Dashboard/Profile.tsx`)
- **Ações:**
  - Substituir inputs por `Input`
  - Substituir textarea por `Textarea`
  - Substituir botões por `Button`
  - Usar `Card` para seções
  - Melhorar espaçamentos

#### ⏳ UserIndex (`src/pages/Dashboard/UserIndex.tsx`)
- **Ações:**
  - Usar `Card` para cards de estatísticas
  - Substituir inputs por `Input`
  - Substituir botões por `Button`
  - Melhorar layout responsivo

#### ⏳ AdminIndex (`src/pages/Dashboard/AdminIndex.tsx`)
- **Ações:**
  - Usar `Card` para cards de métricas
  - Usar `Table` para tabela de usuários
  - Substituir botões por `Button`
  - Melhorar responsividade (tabela como cards em mobile)

#### ⏳ AdminDevocionais (`src/pages/Dashboard/AdminDevocionais.tsx`)
- **Ações:**
  - Usar `Card` para cards de devocionais
  - Usar `Input` e `Textarea` no modal
  - Substituir botões por `Button`
  - Melhorar scroll do modal

#### ⏳ AdminProjetos (`src/pages/Dashboard/AdminProjetos.tsx`)
- **Ações:**
  - Usar `Card` para cards de projetos
  - Usar `Input` e `Textarea` no modal
  - Substituir botões por `Button`
  - Melhorar layout

---

### FASE 3: Páginas Públicas (Média Prioridade)

#### ⏳ Home (`src/pages/Home.tsx`)
- **Ações:**
  - Padronizar espaçamentos
  - Melhorar responsividade
  - Usar `Card` onde apropriado

#### ⏳ Mentorias (`src/pages/Mentorias.tsx`)
- **Ações:**
  - Melhorar cards de mentoria
  - Otimizar paginação
  - Melhorar responsividade

#### ⏳ Projetos (`src/pages/Projetos.tsx`)
- **Ações:**
  - Usar `Card` para cards de projetos
  - Melhorar modal de aplicação
  - Otimizar responsividade

---

## 🔧 PADRÕES DE IMPLEMENTAÇÃO

### Substituindo Botões

**Antes:**
```tsx
<button className="px-4 py-2 rounded-lg bg-purple text-white hover:bg-purple-light">
  Salvar
</button>
```

**Depois:**
```tsx
<Button variant="primary" size="md">
  Salvar
</Button>
```

### Substituindo Inputs

**Antes:**
```tsx
<div>
  <label className="text-sm text-text-secondary">Email</label>
  <input 
    className="w-full px-4 py-2 rounded-xl bg-input border border-border"
    placeholder="seu@email.com"
  />
</div>
```

**Depois:**
```tsx
<Input
  label="Email"
  type="email"
  placeholder="seu@email.com"
  leftIcon={<Mail size={18} />}
/>
```

### Substituindo Cards

**Antes:**
```tsx
<div className="rounded-2xl border border-border bg-surface p-6">
  <h3 className="text-lg font-semibold">Título</h3>
  <p>Conteúdo</p>
</div>
```

**Depois:**
```tsx
<Card title="Título" padding="md">
  <p>Conteúdo</p>
</Card>
```

### Substituindo Tabelas

**Antes:**
```tsx
<div className="rounded-2xl border border-border bg-surface overflow-hidden">
  <table className="w-full">
    <thead>
      <tr>
        <th>Nome</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>João</td>
      </tr>
    </tbody>
  </table>
</div>
```

**Depois:**
```tsx
<Table
  headers={[{ label: 'Nome' }]}
  emptyMessage="Nenhum item encontrado"
>
  <TableRow>
    <TableCell>João</TableCell>
  </TableRow>
</Table>
```

---

## 📐 PADRÕES DE ESPAÇAMENTO

Use esta escala consistente:

- **Gaps entre elementos:** `gap-4` (16px) padrão, `gap-6` (24px) para seções
- **Padding de cards:** `p-6` (24px) padrão, `p-4` (16px) para compactos
- **Padding de seções:** `py-8` (32px) padrão, `py-12` (48px) para destacadas
- **Espaçamento entre inputs:** `space-y-5` (20px) em formulários

---

## 🎨 MELHORIAS DE ACESSIBILIDADE

Ao aplicar componentes, garantir:

1. **Labels sempre presentes** em inputs
2. **aria-labels** em botões sem texto
3. **Focus states visíveis** (já implementados nos componentes base)
4. **Contraste adequado** (verificar com ferramentas de acessibilidade)
5. **Navegação por teclado** funcional

---

## 📱 RESPONSIVIDADE

Ao aplicar melhorias, garantir:

1. **Mobile (< 640px):**
   - Tabelas como cards ou scroll horizontal com indicador
   - Formulários em coluna única
   - Botões full-width quando apropriado
   - Padding reduzido (`p-4` ao invés de `p-6`)

2. **Tablet (640px - 1024px):**
   - Grids de 2 colunas onde apropriado
   - Espaçamentos médios

3. **Desktop (> 1024px):**
   - Grids de 3+ colunas
   - Max-width em containers (`max-w-6xl` ou `max-w-7xl`)
   - Espaçamentos maiores

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

Para cada página/componente atualizado:

- [ ] Componentes base importados e usados
- [ ] Espaçamentos padronizados
- [ ] Responsividade testada (mobile, tablet, desktop)
- [ ] Dark/Light mode testado
- [ ] Acessibilidade verificada (labels, aria-labels, focus)
- [ ] Funcionalidades existentes mantidas
- [ ] Sem erros de lint
- [ ] Visual consistente com o resto do projeto

---

## 🐛 PROBLEMAS COMUNS E SOLUÇÕES

### Problema: Componente não aceita todas as props
**Solução:** Usar `{...props}` nos componentes base ou adicionar props específicas

### Problema: Estilos conflitantes
**Solução:** Verificar ordem de classes Tailwind, usar `!important` apenas quando necessário

### Problema: Dark mode não funciona
**Solução:** Usar variáveis CSS (`var(--color-*)`) ao invés de cores hardcoded

### Problema: Responsividade quebrada
**Solução:** Testar em diferentes tamanhos, usar breakpoints do Tailwind (`sm:`, `md:`, `lg:`)

---

## 📚 RECURSOS

- **Componentes Base:** `src/components/ui/`
- **Design Tokens:** `design-tokens.json`
- **CSS Global:** `src/index.css`
- **Relatório de Análise:** `UI_UX_ANALYSIS_REPORT.md`
- **Melhorias Implementadas:** `IMPROVEMENTS_IMPLEMENTED.md`

---

**Última atualização:** $(date)



