# M90 - Sistema Protocolo M90

Sistema de gestao de protocolos medicos para tratamento com Tirzepatida, voltado para clinicas medicas. Permite o acompanhamento completo de pacientes, incluindo aplicacoes de medicacao, consultas, medicoes corporais, planos de indicacao e controle de estoque.

## Tech Stack

- **Framework**: Next.js 15 (App Router, Server Actions, Turbopack)
- **Linguagem**: TypeScript 5
- **UI**: React 19, Radix UI, Tailwind CSS, Lucide Icons
- **Formularios**: React Hook Form + Zod
- **Graficos**: Recharts
- **Banco de Dados**: PostgreSQL 16 (via Docker)
- **ORM**: Prisma 6
- **Autenticacao**: NextAuth v5 (JWT)
- **Runtime**: Node.js 20+

## Pre-requisitos

- [Node.js](https://nodejs.org/) >= 20
- [Docker](https://www.docker.com/) e Docker Compose
- npm (incluso com Node.js)

## Instalacao

```bash
# 1. Clone o repositorio
git clone <url-do-repo>
cd M90

# 2. Instale as dependencias
npm install

# 3. Suba o banco de dados PostgreSQL
docker compose up -d

# 4. Gere o client do Prisma
npm run db:generate

# 5. Execute as migrations
npm run db:migrate

# 6. Popule o banco com dados iniciais
npm run db:seed

# 7. Inicie o servidor de desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Variaveis de Ambiente

O projeto utiliza um arquivo `.env` na raiz. Variaveis necessarias:

| Variavel         | Descricao                              | Exemplo                                             |
| ---------------- | -------------------------------------- | --------------------------------------------------- |
| `DATABASE_URL`   | Connection string do PostgreSQL        | `postgresql://m90user:m90pass@localhost:5432/m90`    |
| `AUTH_SECRET`    | Segredo para assinar tokens JWT        | `dev-secret-change-in-production-abc123def456`       |
| `AUTH_URL`       | URL base da aplicacao                  | `http://localhost:3000`                              |
| `AUTH_TRUST_HOST`| Confiar no header Host para proxy      | `true`                                               |

## Scripts Disponiveis

| Script            | Comando              | Descricao                                  |
| ----------------- | -------------------- | ------------------------------------------ |
| `dev`             | `npm run dev`        | Inicia servidor dev com Turbopack          |
| `build`           | `npm run build`      | Build de producao                          |
| `start`           | `npm run start`      | Inicia servidor de producao                |
| `lint`            | `npm run lint`       | Executa ESLint                             |
| `db:generate`     | `npm run db:generate`| Gera o Prisma Client                       |
| `db:push`         | `npm run db:push`    | Sincroniza schema com o banco (sem migration)|
| `db:migrate`      | `npm run db:migrate` | Cria e executa migrations                  |
| `db:seed`         | `npm run db:seed`    | Popula o banco com dados de teste          |
| `db:studio`       | `npm run db:studio`  | Abre o Prisma Studio (GUI do banco)        |

## Credenciais de Teste

Apos executar `npm run db:seed`, os seguintes usuarios estarao disponiveis:

| Email                  | Senha      | Papel          |
| ---------------------- | ---------- | -------------- |
| `admin@m90.com`        | `admin123` | Administrador  |
| `enfermagem@m90.com`   | `user123`  | Enfermagem     |
| `endocrino@m90.com`    | `user123`  | Endocrinologista|
| `nutri@m90.com`        | `user123`  | Nutricionista  |

Todos os usuarios estao vinculados a clinica de Florianopolis.

## Estrutura de Diretorios

```
M90/
├── prisma/
│   ├── schema.prisma          # Schema do banco de dados
│   ├── seed.ts                # Script de seed
│   └── migrations/            # Migrations do Prisma
├── src/
│   ├── app/
│   │   ├── (authenticated)/   # Rotas protegidas
│   │   │   ├── dashboard/     # Dashboard principal
│   │   │   ├── patients/      # CRUD de pacientes
│   │   │   │   ├── [id]/      # Detalhe e edicao
│   │   │   │   └── new/       # Novo paciente
│   │   │   └── users/         # Gestao de usuarios (admin)
│   │   ├── api/
│   │   │   ├── auth/          # Endpoints NextAuth
│   │   │   └── export/        # Exportacao CSV
│   │   └── login/             # Pagina de login
│   ├── components/
│   │   ├── ui/                # Componentes base (shadcn/ui)
│   │   ├── layout/            # Sidebar e Header
│   │   ├── dashboard/         # Componentes do dashboard
│   │   ├── patient/           # Componentes de paciente
│   │   └── users/             # Componentes de usuarios
│   └── lib/
│       ├── actions/           # Server Actions (mutations)
│       ├── queries/           # Data fetching
│       ├── auth.ts            # Configuracao NextAuth
│       ├── auth.config.ts     # Callbacks e protecao de rotas
│       ├── patient-calculations.ts  # Calculos e alertas
│       ├── prisma.ts          # Singleton PrismaClient
│       └── utils.ts           # Utilitarios
├── docker-compose.yml         # PostgreSQL para dev
├── package.json
└── tsconfig.json
```

## Documentacao

- [PRD - Product Requirements](docs/PRD.md)
- [Arquitetura](docs/ARCHITECTURE.md)
- [Banco de Dados](docs/DATABASE.md)
- [API e Server Actions](docs/API.md)
