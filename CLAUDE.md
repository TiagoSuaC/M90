# CLAUDE.md - Contexto para Claude Code

## Sobre o Projeto

M90 e um sistema de gestao de protocolos medicos para tratamento com Tirzepatida. Construido com Next.js 15, Prisma, PostgreSQL e NextAuth.

## Comandos Uteis

```bash
npm run dev              # Dev server com Turbopack
npm run db:migrate       # Criar e executar migrations
npm run db:seed          # Popular banco com dados de teste
npm run db:studio        # Abrir Prisma Studio
npm run lint             # Executar ESLint
docker compose up -d     # Subir PostgreSQL
```

## Convencoes do Projeto

### Estrutura de Arquivos
- **Server Actions**: `src/lib/actions/<entidade>.ts` — toda mutacao de dados e uma Server Action
- **Queries**: `src/lib/queries/<entidade>.ts` — data fetching isolado em queries
- **Componentes**: `src/components/<dominio>/<nome>.tsx` — organizados por dominio (dashboard, patient, ui, layout, users)
- **Paginas**: `src/app/(authenticated)/<rota>/page.tsx` — rotas protegidas dentro do route group
- **UI base**: `src/components/ui/` — componentes shadcn/ui, nao modificar diretamente

### Padroes de Codigo
- Todo arquivo usa TypeScript strict
- Path alias: `@/*` aponta para `./src/*`
- Validacao com Zod em toda Server Action
- Formatacao de datas em pt-BR com `date-fns`
- Decimais do Prisma precisam ser serializados com `serialize()` de `@/lib/serialize` antes de passar para Client Components
- Revalidacao de cache: `revalidatePath('/patients/[id]')` e `revalidatePath('/dashboard')` apos mutacoes

### Autenticacao e Autorizacao
- NextAuth v5 com strategy JWT
- Sessao disponivel via `await auth()` em Server Components/Actions
- Roles: ADMIN, NURSING, ENDOCRINO, NUTRI
- Apenas ADMIN pode gerenciar usuarios e ajustar estoque
- Middleware protege todas as rotas exceto `/login` e `/api/auth`

### Banco de Dados
- PostgreSQL 16 via Docker Compose
- Prisma como ORM — singleton em `src/lib/prisma.ts`
- Campos de data usam `@db.Date` (sem hora)
- Campos monetarios/dosagem usam `Decimal(5,2)` ou `Decimal(6,2)`
- Sempre rodar `npm run db:generate` apos alterar schema

### Padroes de Server Actions
Toda Server Action segue o padrao:
1. Extrair e validar dados com Zod
2. Verificar sessao com `await auth()`
3. Executar operacao no Prisma
4. Chamar `revalidatePath()` nos caminhos afetados
5. Retornar `{ success: true }` ou `{ error: "mensagem" }`

### Sistema de Alertas
Calculados em `src/lib/patient-calculations.ts`:
- `STOCK_LOW`: RED se <=10mg, YELLOW se <=20mg
- `MEDICATION_ENDING`: RED se <=7 dias, YELLOW se <=14 dias
- `RETURN_PENDING`: YELLOW se consulta atrasada >4 semanas
- `PACKAGE_ENDING`: RED se 0 semanas, YELLOW se <=2 semanas

## Credenciais de Teste
- admin@m90.com / admin123 (ADMIN)
- enfermagem@m90.com / user123 (NURSING)
- endocrino@m90.com / user123 (ENDOCRINO)
- nutri@m90.com / user123 (NUTRI)
