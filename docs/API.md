# API e Server Actions

## Visao Geral

O M90 utiliza **Server Actions** (Next.js) para todas as mutacoes de dados. Nao ha API REST tradicional — a comunicacao entre client e server acontece diretamente via chamadas de funcao do React.

Os unicos endpoints HTTP sao:
- `/api/auth/[...nextauth]` — autenticacao (NextAuth)
- `/api/export/patients` — exportacao CSV

## Server Actions

### Autenticacao (`src/lib/actions/auth.ts`)

#### `loginAction(formData: FormData)`
Autentica o usuario via NextAuth Credentials provider.

| Parametro | Tipo     | Origem   | Descricao        |
| --------- | -------- | -------- | ---------------- |
| email     | string   | FormData | Email do usuario |
| password  | string   | FormData | Senha            |

**Retorno:** Redireciona para `/dashboard` em caso de sucesso, ou retorna `{ error: string }`.

#### `logoutAction()`
Encerra a sessao do usuario.

**Retorno:** Redireciona para `/login`.

---

### Pacientes (`src/lib/actions/patients.ts`)

#### `createPatient(formData: FormData)`
Cria um novo paciente com indicacao inicial opcional.

**Validacao (Zod):**

| Campo                   | Tipo    | Obrigatorio | Regra                    |
| ----------------------- | ------- | ----------- | ------------------------ |
| fullName                | string  | Sim         | Min 2 caracteres         |
| contractCode            | string  | Nao         | —                        |
| clinicId                | string  | Sim         | —                        |
| packageTemplateId       | string  | Sim         | —                        |
| startDate               | string  | Sim         | Convertido para Date     |
| notes                   | string  | Nao         | —                        |
| initialDoseMg           | string  | Nao         | > 0 se informado         |
| initialFrequencyDays    | string  | Nao         | > 0 se informado         |

**Retorno:** `{ success: true, patientId: string }` ou `{ error: string }`

**Revalidacao:** `/dashboard`

#### `updatePatient(formData: FormData)`
Atualiza dados do paciente.

| Campo     | Tipo   | Obrigatorio | Descricao                |
| --------- | ------ | ----------- | ------------------------ |
| id        | string | Sim         | ID do paciente           |
| fullName  | string | Sim         | Min 2 caracteres         |
| clinicId  | string | Sim         | —                        |
| startDate | string | Sim         | Convertido para Date     |
| notes     | string | Nao         | —                        |

**Retorno:** `{ success: true }` ou `{ error: string }`

**Revalidacao:** `/patients/{id}`, `/dashboard`

#### `updatePatientStatus(patientId: string, status: PatientStatus)`
Altera o status do paciente. **Somente ADMIN.**

**Retorno:** `{ success: true }` ou `{ error: string }`

**Revalidacao:** `/patients/{id}`, `/dashboard`

---

### Aplicacoes (`src/lib/actions/applications.ts`)

#### `createApplication(formData: FormData)`
Registra uma aplicacao de medicacao. Valida estoque disponivel.

**Validacao (Zod):**

| Campo           | Tipo   | Obrigatorio | Regra            |
| --------------- | ------ | ----------- | ---------------- |
| patientId       | string | Sim         | —                |
| applicationDate | string | Sim         | Convertido Date  |
| doseMg          | string | Sim         | > 0              |
| notes           | string | Nao         | —                |

**Regra de negocio:** Verifica se `mgRemaining >= doseMg` antes de permitir.

**Retorno:** `{ success: true }` ou `{ error: string }`

**Revalidacao:** `/patients/{id}`, `/dashboard`

#### `updateApplication(formData: FormData)`
Atualiza uma aplicacao existente. Re-valida estoque.

**Campos adicionais:** `id` (ID da aplicacao)

**Retorno:** `{ success: true }` ou `{ error: string }`

#### `deleteApplication(id: string, patientId: string)`
Remove uma aplicacao.

**Retorno:** `{ success: true }` ou `{ error: string }`

---

### Indicacoes (`src/lib/actions/indications.ts`)

#### `createIndication(formData: FormData)`
Cria uma indicacao individual.

**Validacao (Zod):**

| Campo                | Tipo   | Obrigatorio | Regra            |
| -------------------- | ------ | ----------- | ---------------- |
| patientId            | string | Sim         | —                |
| startDate            | string | Sim         | Convertido Date  |
| doseMgPerApplication | string | Sim         | > 0              |
| frequencyDays        | string | Sim         | > 0              |
| notes                | string | Nao         | —                |

**Retorno:** `{ success: true }` ou `{ error: string }`

#### `saveIndicationPlan(input: object)`
Salva plano de indicacao com multiplas fases em transacao.

**Input:**

```typescript
{
  patientId: string;
  startDate: string;  // Data de inicio do plano
  phases: {
    id?: string;      // Se existente, atualiza; senao, cria
    weeks: number;    // Duracao da fase em semanas (> 0)
    doseMg: number;   // Dose por aplicacao (> 0)
    frequencyDays: number; // Frequencia em dias (> 0)
    notes?: string;
  }[];
}
```

**Logica:**
1. Calcula `phaseOrder` e `startDate` de cada fase acumulando semanas
2. Atualiza fases existentes (por ID)
3. Cria novas fases
4. Remove fases que estavam no banco mas nao vieram no input
5. Tudo em `prisma.$transaction`

**Retorno:** `{ success: true }` ou `{ error: string }`

#### `deleteIndication(indicationId: string)`
Remove uma indicacao.

---

### Consultas (`src/lib/actions/consultations.ts`)

#### `createConsultation(formData: FormData)`
Cria uma consulta medica.

**Validacao (Zod):**

| Campo            | Tipo    | Obrigatorio | Regra                              |
| ---------------- | ------- | ----------- | ---------------------------------- |
| patientId        | string  | Sim         | —                                  |
| type             | enum    | Sim         | "ENDOCRINO" ou "NUTRI"             |
| consultationDate | string  | Sim         | Convertido Date                    |
| professional     | string  | Sim         | —                                  |
| notes            | string  | Nao         | —                                  |
| countsInPackage  | string  | Nao         | Convertido boolean (default true)  |
| dietNotes        | string  | Nao         | Apenas para ENDOCRINO              |
| trainingNotes    | string  | Nao         | Apenas para ENDOCRINO              |
| sleepNotes       | string  | Nao         | Apenas para ENDOCRINO              |
| hydrationNotes   | string  | Nao         | Apenas para ENDOCRINO              |
| otherNotes       | string  | Nao         | Apenas para ENDOCRINO              |

**Retorno:** `{ success: true }` ou `{ error: string }`

#### `updateConsultation(formData: FormData)`
Atualiza uma consulta. Mesmos campos + `id`.

#### `deleteConsultation(id: string, patientId: string)`
Remove uma consulta.

---

### Medicoes (`src/lib/actions/measurements.ts`)

#### `createMeasurement(formData: FormData)`
Registra uma medicao corporal.

**Validacao (Zod):**

| Campo           | Tipo   | Obrigatorio | Regra                    |
| --------------- | ------ | ----------- | ------------------------ |
| patientId       | string | Sim         | —                        |
| measurementDate | string | Sim         | Convertido Date          |
| weightKg        | string | Sim         | > 0                      |
| fatPercentage   | string | Nao         | > 0 se informado         |
| leanMassKg      | string | Nao         | > 0 se informado         |
| notes           | string | Nao         | —                        |

**Retorno:** `{ success: true }` ou `{ error: string }`

#### `updateMeasurement(formData: FormData)`
Atualiza uma medicao. Mesmos campos + `id`.

#### `deleteMeasurement(id: string, patientId: string)`
Remove uma medicao.

---

### Estoque (`src/lib/actions/stock.ts`)

**Todas as acoes requerem role ADMIN.**

#### `createStockAdjustment(formData: FormData)`
Cria um ajuste de estoque.

**Validacao (Zod):**

| Campo        | Tipo   | Obrigatorio | Regra                      |
| ------------ | ------ | ----------- | -------------------------- |
| patientId    | string | Sim         | —                          |
| adjustmentMg | string | Sim         | != 0 (positivo ou negativo)|
| reason       | string | Sim         | —                          |

**Retorno:** `{ success: true }` ou `{ error: string }`

#### `updateStockAdjustment(formData: FormData)`
Atualiza um ajuste. Mesmos campos + `id`. **ADMIN only.**

#### `deleteStockAdjustment(id: string, patientId: string)`
Remove um ajuste. **ADMIN only.**

---

### Usuarios (`src/lib/actions/users.ts`)

**Todas as acoes requerem role ADMIN.**

#### `createUser(formData: FormData)`
Cria um novo usuario.

**Validacao (Zod):**

| Campo    | Tipo   | Obrigatorio | Regra                                   |
| -------- | ------ | ----------- | --------------------------------------- |
| name     | string | Sim         | —                                       |
| email    | string | Sim         | Formato email valido                    |
| password | string | Sim         | Min 6 caracteres                        |
| role     | enum   | Sim         | "ADMIN", "NURSING", "ENDOCRINO", "NUTRI"|
| clinicId | string | Nao         | —                                       |

**Retorno:** `{ success: true }` ou `{ error: string }`

#### `updateUser(formData: FormData)`
Atualiza usuario. Senha opcional (min 6 chars se informada). Verifica unicidade de email.

#### `deleteUser(userId: string)`
Remove usuario. Nao permite deletar o proprio usuario logado. **ADMIN only.**

---

## Queries (`src/lib/queries/`)

### Patient Queries (`src/lib/queries/patient-with-metrics.ts`)

#### `getPatientById(id: string)`
Busca paciente com todos os relacionamentos (clinic, packageTemplate, applications, indications, consultations, measurements, stockAdjustments).

#### `getPatientWithMetrics(id: string)`
Busca paciente e calcula metricas (semanas, mg, consultas, alertas, projecoes).

**Retorno:** `{ patient, metrics }` serializado para Client Components.

#### `getPatientsWithMetrics(filters?)`
Busca todos os pacientes com metricas calculadas. Suporta filtros e ordenacao.

**Filtros disponoveis:**

| Filtro    | Tipo   | Descricao                              |
| --------- | ------ | -------------------------------------- |
| clinicId  | string | Filtrar por clinica                    |
| status    | string | Filtrar por status (ACTIVE, etc.)      |
| search    | string | Busca por nome (case-insensitive)      |
| startFrom | string | Data inicio >= valor                   |
| startTo   | string | Data inicio <= valor                   |
| lowStock  | string | "true" para apenas estoque baixo       |

**Ordenacao:**

| Campo                | Descricao                    |
| -------------------- | ---------------------------- |
| fullName             | Nome do paciente             |
| clinic               | Nome da clinica              |
| weeksElapsed         | Semanas decorridas           |
| mgRemaining          | mg restantes                 |
| nextApplicationDate  | Proxima aplicacao            |
| status               | Status                       |

#### `getClinics()`
Retorna todas as clinicas ordenadas por nome.

#### `getPackageTemplates()`
Retorna templates de pacote ativos.

### User Queries (`src/lib/queries/users.ts`)

#### `getUsers()`
Retorna todos os usuarios com clinica associada, ordenados por nome.

---

## Endpoints HTTP

### `GET /api/auth/[...nextauth]`
### `POST /api/auth/[...nextauth]`
Handlers automaticos do NextAuth. Gerenciam login, logout, sessao e callbacks.

### `GET /api/export/patients`
Exporta lista de pacientes em formato CSV.

**Autenticacao:** Requer sessao ativa.

**Retorno:** Arquivo CSV com BOM (compativel com Excel) contendo:

| Coluna             | Descricao                         |
| ------------------ | --------------------------------- |
| Nome               | Nome completo                     |
| Unidade            | Nome da clinica                   |
| Status             | Status do paciente                |
| Data Inicio        | Data de inicio (dd/MM/yyyy)       |
| Semanas            | "X de Y"                          |
| mg Aplicados       | Total aplicado                    |
| mg Restantes       | Estoque restante                  |
| Indicacao Atual    | Dose atual (mg)                   |
| Frequencia         | Frequencia em dias                |
| Proxima Aplicacao  | Data estimada (dd/MM/yyyy)        |
| Endocrino          | "X de Y"                          |
| Nutri              | "X de Y"                          |
| Alertas            | Lista de mensagens de alerta      |

**Headers de resposta:**
- `Content-Type: text/csv; charset=utf-8`
- `Content-Disposition: attachment; filename=pacientes-YYYY-MM-DD.csv`

---

## Padrao de Retorno das Actions

Todas as Server Actions seguem o mesmo padrao:

```typescript
// Sucesso
{ success: true }
// ou
{ success: true, patientId: "..." }

// Erro de validacao
{ error: "Dados invalidos" }

// Erro de autorizacao
{ error: "Nao autorizado" }

// Erro de negocio
{ error: "Estoque insuficiente: apenas Xmg disponiveis" }
```

## Revalidacao de Cache

Apos cada mutacao, as actions chamam `revalidatePath()` nos caminhos afetados:

| Action          | Paths revalidados                     |
| --------------- | ------------------------------------- |
| createPatient   | `/dashboard`                          |
| updatePatient   | `/patients/{id}`, `/dashboard`        |
| updateStatus    | `/patients/{id}`, `/dashboard`        |
| *Application    | `/patients/{id}`, `/dashboard`        |
| *Indication     | `/patients/{id}`                      |
| *Consultation   | `/patients/{id}`                      |
| *Measurement    | `/patients/{id}`                      |
| *StockAdjustment| `/patients/{id}`, `/dashboard`        |
| *User           | `/users`                              |
