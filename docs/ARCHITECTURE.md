# Arquitetura do Sistema

## Diagrama da Stack

```
┌─────────────────────────────────────────────────┐
│                   Browser                       │
│          (React 19 + Tailwind CSS)              │
└─────────────────────┬───────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────┐
│              Next.js 15 (App Router)            │
│  ┌──────────────┐  ┌────────────────────────┐   │
│  │  Pages/       │  │  Server Actions        │   │
│  │  Layouts      │  │  (src/lib/actions/)    │   │
│  │  (RSC)        │  └───────────┬────────────┘   │
│  └──────┬───────┘              │               │
│         │              ┌───────▼────────────┐   │
│         │              │  Queries           │   │
│         ├──────────────┤  (src/lib/queries/) │   │
│         │              └───────┬────────────┘   │
│  ┌──────▼───────┐              │               │
│  │  Client      │      ┌──────▼─────────┐      │
│  │  Components  │      │  Prisma ORM    │      │
│  │  (interacao) │      └──────┬─────────┘      │
│  └──────────────┘              │               │
│                                │               │
│  ┌─────────────────────────────┤               │
│  │  NextAuth v5 (JWT)         │               │
│  │  Middleware                 │               │
│  └─────────────────────────────┤               │
└────────────────────────────────┼───────────────┘
                                 │
                      ┌──────────▼──────────┐
                      │  PostgreSQL 16      │
                      │  (Docker Compose)   │
                      └─────────────────────┘
```

## Estrutura de Pastas Detalhada

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (HTML, fonts, metadata)
│   ├── page.tsx                  # Raiz — redireciona para /dashboard
│   ├── globals.css               # Estilos globais + variaveis CSS
│   │
│   ├── login/
│   │   └── page.tsx              # Formulario de login
│   │
│   ├── (authenticated)/          # Route Group — layout com sidebar/header
│   │   ├── layout.tsx            # Layout autenticado (verifica sessao)
│   │   ├── dashboard/
│   │   │   └── page.tsx          # Dashboard com tabela, filtros, alertas
│   │   ├── patients/
│   │   │   ├── new/
│   │   │   │   └── page.tsx      # Formulario novo paciente
│   │   │   └── [id]/
│   │   │       ├── page.tsx      # Detalhe do paciente (abas)
│   │   │       └── edit/
│   │   │           └── page.tsx  # Edicao de paciente
│   │   └── users/
│   │       └── page.tsx          # Gestao de usuarios (admin)
│   │
│   └── api/
│       ├── auth/
│       │   └── [...nextauth]/
│       │       └── route.ts      # Handlers NextAuth (GET, POST)
│       └── export/
│           └── patients/
│               └── route.ts      # Export CSV de pacientes
│
├── components/
│   ├── ui/                       # Componentes base (shadcn/ui)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── table.tsx
│   │   ├── tabs.tsx
│   │   ├── select.tsx
│   │   ├── input.tsx
│   │   ├── badge.tsx
│   │   ├── progress.tsx
│   │   ├── inline-progress.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── alert-dialog.tsx
│   │   ├── tooltip.tsx
│   │   ├── separator.tsx
│   │   ├── label.tsx
│   │   └── textarea.tsx
│   │
│   ├── layout/
│   │   ├── sidebar.tsx           # Navegacao lateral (fixa desktop)
│   │   └── header.tsx            # Header com menu usuario
│   │
│   ├── dashboard/
│   │   ├── stats-cards.tsx       # 4 cards de metricas
│   │   ├── alert-summary.tsx     # Lista de alertas
│   │   ├── patient-table.tsx     # Tabela de pacientes
│   │   ├── filters.tsx           # Filtros (busca, clinica, status, etc.)
│   │   ├── sortable-header.tsx   # Header de coluna com ordenacao
│   │   └── quick-apply-dialog.tsx# Dialog de aplicacao rapida
│   │
│   ├── patient/
│   │   ├── patient-form.tsx      # Form de criacao/edicao
│   │   ├── summary-cards.tsx     # Cards de resumo do paciente
│   │   ├── applications-tab.tsx  # Aba de aplicacoes
│   │   ├── indications-tab.tsx   # Aba de indicacoes (protocolo)
│   │   ├── consultations-tab.tsx # Aba de consultas
│   │   ├── measurements-tab.tsx  # Aba de pesagens
│   │   ├── stock-adjustment-tab.tsx # Aba de estoque
│   │   ├── weight-chart.tsx      # Grafico de peso (Recharts)
│   │   ├── alert-badges.tsx      # Badges de alerta
│   │   └── patient-status-select.tsx # Select de status
│   │
│   └── users/
│       └── users-manager.tsx     # CRUD de usuarios
│
└── lib/
    ├── actions/                  # Server Actions (mutacoes)
    │   ├── auth.ts               # login, logout
    │   ├── patients.ts           # createPatient, updatePatient, updatePatientStatus
    │   ├── applications.ts       # createApplication, updateApplication, deleteApplication
    │   ├── indications.ts        # createIndication, saveIndicationPlan, deleteIndication
    │   ├── consultations.ts      # createConsultation, updateConsultation, deleteConsultation
    │   ├── measurements.ts       # createMeasurement, updateMeasurement, deleteMeasurement
    │   ├── stock.ts              # createStockAdjustment, updateStockAdjustment, deleteStockAdjustment
    │   └── users.ts              # createUser, updateUser, deleteUser
    │
    ├── queries/                  # Data fetching
    │   ├── patient-with-metrics.ts # getPatientById, getPatientWithMetrics, getPatientsWithMetrics, getClinics, getPackageTemplates
    │   └── users.ts              # getUsers
    │
    ├── auth.ts                   # NextAuth config (Credentials provider)
    ├── auth.config.ts            # Callbacks JWT/Session, protecao de rotas
    ├── auth-types.ts             # Extensao de tipos NextAuth
    ├── patient-calculations.ts   # Metricas e alertas
    ├── prisma.ts                 # PrismaClient singleton
    ├── serialize.ts              # Serializacao Decimal/Date para Client Components
    └── utils.ts                  # cn(), formatDate(), formatDecimal()
```

## Padroes Utilizados

### App Router (Next.js 15)
- **Server Components** por padrao — paginas e layouts sao RSC
- **Client Components** com `"use client"` apenas quando necessario (interacao, hooks, estado)
- **Route Groups** `(authenticated)` — agrupa rotas que compartilham layout com sidebar/header
- **Dynamic Routes** `[id]` — para detalhe de paciente

### Server Actions
- Toda mutacao de dados e feita via Server Actions (`"use server"`)
- Actions ficam em `src/lib/actions/` organizadas por entidade
- Padrao consistente: validar (Zod) → autenticar → executar (Prisma) → revalidar → retornar

### Validacao com Zod
- Schemas Zod definidos junto a cada action
- Validacao tanto de tipos quanto de regras de negocio (ex: dose > 0)
- Transformacoes (ex: string para Date, string para Decimal)

### Serializacao
- Objetos do Prisma com `Decimal` e `Date` precisam ser serializados antes de passar para Client Components
- Funcao `serialize()` em `src/lib/serialize.ts` converte via JSON round-trip

## Fluxo de Autenticacao

```
1. Usuario envia email/senha
       │
       ▼
2. loginAction() → signIn("credentials", ...)
       │
       ▼
3. NextAuth Credentials Provider
   → Busca usuario no Prisma (com clinic)
   → Compara senha com bcrypt
       │
       ▼
4. JWT Callback
   → Adiciona role, clinicId, clinicName ao token
       │
       ▼
5. Session Callback
   → Mapeia token para session.user
       │
       ▼
6. Middleware (middleware.ts)
   → Roda em toda requisicao (exceto static assets)
   → Redireciona para /login se nao autenticado
   → Redireciona de /login para /dashboard se ja autenticado
```

### Protecao de Rotas
- **Middleware**: intercepta todas as rotas, verifica sessao JWT
- **Server Components**: verificam `await auth()` para dados do usuario
- **Server Actions**: verificam `await auth()` antes de executar
- **Verificacao de role**: feita na action (ex: `role !== "ADMIN"` retorna erro)

## Camadas da Aplicacao

```
┌─────────────────────────────────────────┐
│  UI Layer (React Components)            │
│  - Pages (Server Components)            │
│  - Client Components (interacao)        │
│  - shadcn/ui components                 │
└──────────────┬──────────────────────────┘
               │ props / form submit
┌──────────────▼──────────────────────────┐
│  Action Layer (Server Actions)          │
│  - Validacao (Zod)                      │
│  - Autorizacao (auth())                 │
│  - Logica de negocio                    │
│  - Revalidacao de cache                 │
└──────────────┬──────────────────────────┘
               │ prisma queries/mutations
┌──────────────▼──────────────────────────┐
│  Data Layer (Prisma + Queries)          │
│  - PrismaClient singleton              │
│  - Queries complexas com includes       │
│  - Calculos de metricas                 │
└──────────────┬──────────────────────────┘
               │ SQL
┌──────────────▼──────────────────────────┐
│  Database (PostgreSQL 16)               │
│  - Migrations gerenciadas pelo Prisma   │
│  - Docker Compose para dev              │
└─────────────────────────────────────────┘
```

## Sistema de Calculos e Alertas

Os calculos de metricas e alertas estao centralizados em `src/lib/patient-calculations.ts`.

### Metricas Calculadas

| Metrica                    | Formula                                            |
| -------------------------- | -------------------------------------------------- |
| Semanas decorridas         | `differenceInWeeks(hoje, startDate)`                |
| Semanas restantes          | `durationWeeks - weeksElapsed`                      |
| Data fim esperada          | `startDate + durationWeeks`                         |
| mg aplicados               | `soma(applications.doseMg)`                         |
| mg ajustados               | `soma(stockAdjustments.adjustmentMg)`               |
| mg restantes               | `totalMg + ajustados - aplicados`                   |
| Consultas endo realizadas  | `count(consultations onde type=ENDOCRINO e countsInPackage=true)` |
| Aplicacoes estimadas       | `mgRestantes / doseAtual`                           |
| Dias estimados restantes   | `aplicacoesEstimadas * frequenciaDias`              |
| Proxima aplicacao          | `ultimaAplicacao + frequenciaDias`                  |

### Regras de Alertas

| Alerta            | Severidade | Condicao                                   |
| ----------------- | ---------- | ------------------------------------------ |
| STOCK_LOW         | RED        | mg restantes <= 10                         |
| STOCK_LOW         | YELLOW     | mg restantes <= 20                         |
| MEDICATION_ENDING | RED        | dias estimados <= 7                        |
| MEDICATION_ENDING | YELLOW     | dias estimados <= 14                       |
| RETURN_PENDING    | YELLOW     | consulta atrasada > 4 semanas              |
| PACKAGE_ENDING    | RED        | semanas restantes = 0                      |
| PACKAGE_ENDING    | YELLOW     | semanas restantes <= 2                     |

## Tecnologias e Bibliotecas

| Categoria        | Tecnologia                    | Uso                                   |
| ---------------- | ----------------------------- | ------------------------------------- |
| Framework        | Next.js 15                    | App Router, RSC, Server Actions       |
| UI               | React 19                      | Rendering                             |
| Componentes      | Radix UI + shadcn/ui          | Componentes acessiveis                |
| Estilo           | Tailwind CSS 3                | Utility-first CSS                     |
| Icones           | Lucide React                  | Icones SVG                            |
| Formularios      | React Hook Form               | Gerenciamento de forms                |
| Validacao        | Zod                           | Schema validation                     |
| Graficos         | Recharts                      | Grafico de peso                       |
| Auth             | NextAuth v5 beta              | JWT, Credentials provider             |
| ORM              | Prisma 6                      | Type-safe database access             |
| Banco            | PostgreSQL 16                 | Banco relacional                      |
| Senhas           | bcryptjs                      | Hash de senhas                        |
| Datas            | date-fns                      | Calculos de data                      |
| Dev              | TypeScript 5, ESLint, Turbopack| DX                                   |
