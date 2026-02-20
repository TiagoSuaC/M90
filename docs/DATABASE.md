# Banco de Dados

## Visao Geral

O sistema utiliza PostgreSQL 16 como banco de dados relacional, gerenciado via Prisma ORM. O schema esta definido em `prisma/schema.prisma`.

## Diagrama ER

```
┌──────────────┐     ┌──────────────────┐     ┌───────────────────┐
│    Clinic    │     │  PackageTemplate │     │       User        │
├──────────────┤     ├──────────────────┤     ├───────────────────┤
│ id (PK)      │     │ id (PK)          │     │ id (PK)           │
│ name         │     │ name (UNIQUE)    │     │ name              │
│ abbreviation │     │ durationWeeks    │     │ email (UNIQUE)    │
│ city         │     │ tirzepatidaTotal │     │ passwordHash      │
│ createdAt    │     │ consultasEndocr  │     │ role (Role)       │
└──────┬───────┘     │ consultasNutri   │     │ clinicId (FK?)    │
       │             │ active           │     │ createdAt         │
       │             │ createdAt        │     │ updatedAt         │
       │             └────────┬─────────┘     └─────┬─────────────┘
       │                      │                      │
       │  1:N                 │  1:N                  │  N:1
       │                      │                      │
       ▼                      ▼                      │
┌──────────────────────────────────────┐             │
│              Patient                 │◄────────────┘
├──────────────────────────────────────┤
│ id (PK)                              │
│ fullName                             │
│ contractCode                         │
│ clinicId (FK) ──────────────────────►│ Clinic
│ packageTemplateId (FK) ─────────────►│ PackageTemplate
│ startDate                            │
│ status (PatientStatus)               │
│ notes                                │
│ createdById                          │
│ createdAt, updatedAt                 │
└───┬──────┬──────┬──────┬──────┬─────┘
    │      │      │      │      │
    │ 1:N  │ 1:N  │ 1:N  │ 1:N  │ 1:N
    ▼      ▼      ▼      ▼      ▼
┌────────┐┌────────┐┌────────┐┌────────┐┌────────────────┐
│Applica-││Medical ││Consul- ││Body    ││Stock           │
│tion    ││Indica- ││tation  ││Measure-││Adjustment      │
│        ││tion    ││        ││ment    ││                │
├────────┤├────────┤├────────┤├────────┤├────────────────┤
│id (PK) ││id (PK) ││id (PK) ││id (PK) ││id (PK)         │
│patient ││patient ││patient ││patient ││patientId (FK)  │
│Id (FK) ││Id (FK) ││Id (FK) ││Id (FK) ││adjustmentMg    │
│applica-││phase   ││type    ││measure-││reason          │
│tionDate││Order   ││consul- ││mentDate││createdById     │
│doseMg  ││start   ││tation  ││weightKg││createdAt       │
│notes   ││Date    ││Date    ││fat%    │└────────────────┘
│adminis-││duratio-││profes- ││leanMass│
│teredBy ││nWeeks  ││sional  ││Kg      │
│created ││doseMg  ││notes   ││notes   │
│At      ││Per App ││diet    ││created │
└────────┘│frequen-││Notes   ││ById   │
          │cyDays  ││train   ││created │
          │notes   ││Notes   ││At      │
          │created ││sleep   │└────────┘
          │ById   ││Notes   │
          │created ││hydra   │
          │At      ││Notes   │
          └────────┘│other   │
                    │Notes   │
                    │counts  │
                    │InPkg   │
                    │created │
                    │ById   │
                    │created │
                    │At      │
                    └────────┘
```

## Modelos

### User

Usuarios do sistema com autenticacao por email/senha.

| Campo          | Tipo      | Descricao                           |
| -------------- | --------- | ----------------------------------- |
| `id`           | String    | CUID, chave primaria                |
| `name`         | String    | Nome completo                       |
| `email`        | String    | Email unico, usado para login       |
| `passwordHash` | String    | Hash bcrypt da senha                |
| `role`         | Role      | Papel do usuario (enum)             |
| `clinicId`     | String?   | FK para Clinic (opcional)           |
| `createdAt`    | DateTime  | Data de criacao                     |
| `updatedAt`    | DateTime  | Data de atualizacao                 |

### Clinic

Unidades clinicas onde os pacientes sao atendidos.

| Campo          | Tipo      | Descricao                           |
| -------------- | --------- | ----------------------------------- |
| `id`           | String    | CUID, chave primaria                |
| `name`         | String    | Nome completo da clinica            |
| `abbreviation` | String?   | Abreviacao (opcional)               |
| `city`         | String    | Cidade                              |
| `createdAt`    | DateTime  | Data de criacao                     |

### PackageTemplate

Templates de pacotes de tratamento.

| Campo                      | Tipo    | Default | Descricao                          |
| -------------------------- | ------- | ------- | ---------------------------------- |
| `id`                       | String  | —       | CUID, chave primaria               |
| `name`                     | String  | —       | Nome unico (ex: "M90")            |
| `durationWeeks`            | Int     | 12      | Duracao em semanas                 |
| `tirzepatidaTotalMg`       | Decimal | 90      | Total de mg de Tirzepatida         |
| `consultasEndocrinoTotal`  | Int     | 3       | Consultas de endocrino inclusas    |
| `consultasNutriTotal`      | Int     | 2       | Consultas de nutri inclusas        |
| `active`                   | Boolean | true    | Se o template esta ativo           |
| `createdAt`                | DateTime| —       | Data de criacao                    |

### Patient

Registro central de pacientes vinculados a clinica e pacote.

| Campo                | Tipo           | Descricao                                |
| -------------------- | -------------- | ---------------------------------------- |
| `id`                 | String         | CUID, chave primaria                     |
| `fullName`           | String         | Nome completo do paciente                |
| `contractCode`       | String         | Codigo do contrato                       |
| `clinicId`           | String         | FK para Clinic                           |
| `packageTemplateId`  | String         | FK para PackageTemplate                  |
| `startDate`          | Date           | Data de inicio do tratamento             |
| `status`             | PatientStatus  | Status atual (enum)                      |
| `notes`              | String?        | Observacoes gerais                       |
| `createdById`        | String         | ID do usuario que criou                  |
| `createdAt`          | DateTime       | Data de criacao                          |
| `updatedAt`          | DateTime       | Data de atualizacao                      |

**Relacionamentos**: applications, indications, consultations, measurements, stockAdjustments

### Application

Registros de aplicacao de Tirzepatida.

| Campo             | Tipo    | Descricao                              |
| ----------------- | ------- | -------------------------------------- |
| `id`              | String  | CUID, chave primaria                   |
| `patientId`       | String  | FK para Patient                        |
| `applicationDate` | Date    | Data da aplicacao                      |
| `doseMg`          | Decimal | Dose aplicada em mg                    |
| `notes`           | String? | Observacoes                            |
| `administeredBy`  | String  | Nome do responsavel pela aplicacao     |
| `createdAt`       | DateTime| Data de criacao                        |

### MedicalIndication

Fases do plano de indicacao medica (protocolo de dosagem).

| Campo                 | Tipo    | Default | Descricao                           |
| --------------------- | ------- | ------- | ----------------------------------- |
| `id`                  | String  | —       | CUID, chave primaria                |
| `patientId`           | String  | —       | FK para Patient                     |
| `phaseOrder`          | Int     | 0       | Ordem da fase no plano              |
| `startDate`           | Date    | —       | Data de inicio da fase              |
| `durationWeeks`       | Int?    | —       | Duracao em semanas (null = indefinido)|
| `doseMgPerApplication`| Decimal | —       | Dose por aplicacao em mg            |
| `frequencyDays`       | Int     | 7       | Frequencia em dias (7=semanal)      |
| `notes`               | String? | —       | Observacoes                         |
| `createdById`         | String  | —       | ID do usuario que criou             |
| `createdAt`           | DateTime| —       | Data de criacao                     |

### Consultation

Consultas medicas (endocrinologia ou nutricao).

| Campo              | Tipo             | Default | Descricao                           |
| ------------------ | ---------------- | ------- | ----------------------------------- |
| `id`               | String           | —       | CUID, chave primaria                |
| `patientId`        | String           | —       | FK para Patient                     |
| `type`             | ConsultationType | —       | ENDOCRINO ou NUTRI                  |
| `consultationDate` | Date             | —       | Data da consulta                    |
| `professional`     | String           | —       | Nome do profissional                |
| `notes`            | String?          | —       | Anotacoes gerais                    |
| `dietNotes`        | String?          | —       | Notas sobre dieta (endocrino)       |
| `trainingNotes`    | String?          | —       | Notas sobre treino (endocrino)      |
| `sleepNotes`       | String?          | —       | Notas sobre sono (endocrino)        |
| `hydrationNotes`   | String?          | —       | Notas sobre hidratacao (endocrino)  |
| `otherNotes`       | String?          | —       | Outras notas (endocrino)            |
| `countsInPackage`  | Boolean          | true    | Se conta no pacote do paciente      |
| `createdById`      | String           | —       | ID do usuario que criou             |
| `createdAt`        | DateTime         | —       | Data de criacao                     |

### BodyMeasurement

Medicoes corporais do paciente.

| Campo             | Tipo    | Descricao                              |
| ----------------- | ------- | -------------------------------------- |
| `id`              | String  | CUID, chave primaria                   |
| `patientId`       | String  | FK para Patient                        |
| `measurementDate` | Date    | Data da medicao                        |
| `weightKg`        | Decimal | Peso em kg                             |
| `fatPercentage`   | Decimal?| Percentual de gordura (opcional)       |
| `leanMassKg`      | Decimal?| Massa magra em kg (opcional)           |
| `notes`           | String? | Observacoes                            |
| `createdById`     | String  | ID do usuario que criou                |
| `createdAt`       | DateTime| Data de criacao                        |

### StockAdjustment

Ajustes manuais no estoque de medicacao do paciente.

| Campo          | Tipo    | Descricao                                |
| -------------- | ------- | ---------------------------------------- |
| `id`           | String  | CUID, chave primaria                     |
| `patientId`    | String  | FK para Patient                          |
| `adjustmentMg` | Decimal | Ajuste em mg (positivo ou negativo)      |
| `reason`       | String  | Motivo do ajuste                         |
| `createdById`  | String  | ID do usuario que criou                  |
| `createdAt`    | DateTime| Data de criacao                          |

## Enums

### Role
Papeis de usuario no sistema.

| Valor      | Descricao                                    |
| ---------- | -------------------------------------------- |
| `ADMIN`    | Administrador — acesso total                 |
| `NURSING`  | Enfermagem — operacoes do dia a dia          |
| `ENDOCRINO`| Endocrinologista — consultas especializadas  |
| `NUTRI`    | Nutricionista — consultas nutricionais       |

### PatientStatus
Status do tratamento do paciente.

| Valor       | Descricao                                   |
| ----------- | ------------------------------------------- |
| `ACTIVE`    | Paciente em tratamento ativo                |
| `COMPLETED` | Tratamento concluido                        |
| `PAUSED`    | Tratamento pausado temporariamente          |
| `CANCELLED` | Tratamento cancelado                        |

### ConsultationType
Tipo de consulta medica.

| Valor      | Descricao                |
| ---------- | ------------------------ |
| `ENDOCRINO`| Consulta endocrinologica |
| `NUTRI`    | Consulta nutricional     |

## Relacionamentos

| Origem            | Destino           | Tipo | FK              |
| ----------------- | ----------------- | ---- | --------------- |
| User              | Clinic            | N:1  | clinicId        |
| Patient           | Clinic            | N:1  | clinicId        |
| Patient           | PackageTemplate   | N:1  | packageTemplateId|
| Application       | Patient           | N:1  | patientId       |
| MedicalIndication | Patient           | N:1  | patientId       |
| Consultation      | Patient           | N:1  | patientId       |
| BodyMeasurement   | Patient           | N:1  | patientId       |
| StockAdjustment   | Patient           | N:1  | patientId       |

## Migrations

| Data       | Nome                              | Descricao                                             |
| ---------- | --------------------------------- | ----------------------------------------------------- |
| 2026-02-13 | `init`                            | Criacao inicial de todas as tabelas, enums e indices  |
| 2026-02-18 | `add_indication_plan_fields`      | Adiciona `durationWeeks` e `phaseOrder` a MedicalIndication |
| 2026-02-19 | `add_endocrino_structured_fields` | Adiciona campos estruturados a Consultation (diet, training, sleep, hydration, other) |

## Precisao dos Campos Decimais

| Campo                  | Precisao       | Uso                          |
| ---------------------- | -------------- | ---------------------------- |
| tirzepatidaTotalMg     | Decimal(6,2)   | Total de mg do pacote        |
| doseMg                 | Decimal(5,2)   | Dose por aplicacao           |
| doseMgPerApplication   | Decimal(5,2)   | Dose por aplicacao (indicacao)|
| weightKg               | Decimal(5,2)   | Peso em kg                   |
| fatPercentage          | Decimal(4,1)   | % gordura corporal           |
| leanMassKg             | Decimal(5,2)   | Massa magra em kg            |
| adjustmentMg           | Decimal(6,2)   | Ajuste de estoque em mg      |

## Dados de Seed

O script `prisma/seed.ts` cria:

**Clinicas:**
- clinic-01: Clinica SC Criciuma
- clinic-02: Clinica SC Curitiba
- clinic-03: Clinica SC Florianopolis
- clinic-04: Clinica SC Balneario Camboriu
- clinic-06: Clinica SC Joinville

**Pacote:** M90 (12 semanas, 90mg, 3 endocrino, 2 nutri)

**Usuarios:** 4 usuarios vinculados a Florianopolis (ver README para credenciais)
