# PRD - Product Requirements Document

## Objetivo do Produto

O M90 e um sistema de gestao de protocolos medicos para tratamento com Tirzepatida (protocolo de 90mg em 12 semanas). O sistema permite que clinicas medicas acompanhem seus pacientes de forma centralizada, controlando aplicacoes de medicacao, consultas medicas, medicoes corporais, planos de dosagem e estoque de medicamentos.

## Publico-Alvo

- **Clinicas medicas** que oferecem tratamento com Tirzepatida
- **Profissionais de saude**: endocrinologistas, nutricionistas e equipe de enfermagem
- **Administradores** de clinicas que precisam de visao gerencial

## Funcionalidades Principais

### 1. Gestao de Pacientes
- Cadastro de pacientes vinculados a uma clinica e pacote de tratamento
- Visualizacao de detalhes completos do paciente com metricas calculadas
- Edicao de dados cadastrais
- Controle de status: Ativo, Concluido, Pausado, Cancelado
- Exportacao da lista de pacientes em CSV

### 2. Protocolo de Indicacao (Plano de Dosagem)
- Criacao de planos de indicacao com multiplas fases
- Cada fase define: duracao (semanas), dose por aplicacao (mg) e frequencia (semanal/quinzenal)
- Calculo automatico de datas de inicio/fim de cada fase
- Totalizacao de aplicacoes e mg previstos
- Identificacao da indicacao vigente

### 3. Aplicacoes de Medicacao
- Registro de aplicacoes com data, dose e responsavel
- Validacao de estoque antes de permitir aplicacao
- Edicao e exclusao de registros
- Aplicacao rapida diretamente do dashboard

### 4. Consultas Medicas
- Dois tipos: Endocrinologia e Nutricao
- Consultas de Endocrino possuem campos estruturados (dieta, treino, sono, hidratacao)
- Consultas de Nutri possuem campo livre de anotacoes
- Flag para indicar se conta no pacote do paciente
- Controle de consultas realizadas vs. previstas no pacote

### 5. Medicoes Corporais
- Registro de peso, percentual de gordura e massa magra
- Historico com grafico de evolucao de peso
- Acompanhamento visual da progressao

### 6. Controle de Estoque
- Calculo automatico de mg restantes (total do pacote + ajustes - aplicacoes)
- Ajustes manuais de estoque (somente admin)
- Alertas de estoque baixo

### 7. Dashboard e Metricas
- Cards de resumo: pacientes ativos, alertas totais, estoque baixo, retornos pendentes
- Tabela de pacientes com filtros (clinica, status, busca, estoque, periodo)
- Ordenacao por qualquer coluna (incluindo campos calculados)
- Indicadores visuais de progresso (semanas, mg)
- Resumo de alertas com severidade

### 8. Sistema de Alertas
- **Estoque Baixo**: critico (<=10mg), alerta (<=20mg)
- **Medicacao Acabando**: critico (<=7 dias), alerta (<=14 dias)
- **Retorno Pendente**: alerta quando consulta atrasada >4 semanas
- **Pacote Encerrando**: critico (0 semanas), alerta (<=2 semanas)

### 9. Gestao de Usuarios (Admin)
- CRUD completo de usuarios
- Atribuicao de papel (role) e clinica
- Protecao contra auto-exclusao

## Roles e Permissoes

| Funcionalidade               | ADMIN | NURSING | ENDOCRINO | NUTRI |
| ---------------------------- | ----- | ------- | --------- | ----- |
| Ver dashboard                | Sim   | Sim     | Sim       | Sim   |
| Cadastrar paciente           | Sim   | Sim     | Sim       | Sim   |
| Editar paciente              | Sim   | Sim     | Sim       | Sim   |
| Alterar status do paciente   | Sim   | Nao     | Nao       | Nao   |
| Registrar aplicacao          | Sim   | Sim     | Sim       | Sim   |
| Registrar consulta           | Sim   | Sim     | Sim       | Sim   |
| Registrar medicao            | Sim   | Sim     | Sim       | Sim   |
| Ajustar estoque              | Sim   | Nao     | Nao       | Nao   |
| Gerenciar usuarios           | Sim   | Nao     | Nao       | Nao   |
| Exportar CSV                 | Sim   | Sim     | Sim       | Sim   |

## Fluxos de Usuario

### Fluxo de Login
1. Usuario acessa a aplicacao
2. Middleware redireciona para `/login` se nao autenticado
3. Usuario informa email e senha
4. Sistema valida credenciais (bcrypt)
5. Sessao JWT criada com role, clinicId e clinicName
6. Redirecionamento para `/dashboard`

### Fluxo de Cadastro de Paciente
1. Usuario clica em "Novo Paciente" no sidebar
2. Preenche formulario: nome, codigo contrato (opcional), clinica, pacote, data inicio
3. Opcionalmente define indicacao inicial (dose e frequencia)
4. Sistema cria paciente e indicacao inicial (se informada)
5. Redirecionamento para pagina de detalhe do paciente

### Fluxo de Acompanhamento de Paciente
1. Usuario acessa detalhe do paciente via dashboard
2. Visualiza cards de resumo (semanas, medicacao, consultas, projecao)
3. Navega entre abas: Aplicacoes, Indicacoes, Consultas, Pesagens, Estoque
4. Registra novas aplicacoes, consultas ou medicoes conforme necessario
5. Sistema recalcula metricas e alertas automaticamente

### Fluxo de Aplicacao Rapida
1. No dashboard, usuario clica no icone de seringa do paciente
2. Dialog abre com data (hoje), dose (da indicacao vigente) e notas
3. Sistema valida estoque disponivel
4. Aplicacao registrada, metricas atualizadas

### Fluxo de Protocolo de Indicacao
1. Na aba Indicacoes, usuario clica em "Criar/Editar Protocolo"
2. Dialog abre com data de inicio e lista de fases
3. Usuario adiciona fases: semanas, dose (mg), frequencia, notas
4. Sistema calcula datas e totais automaticamente
5. Ao salvar, fases sao criadas/atualizadas/removidas em transacao

## Regras de Negocio

### Calculo de Estoque
```
mgRestantes = mgTotalPacote + somaAjustes - somaAplicacoes
```
- Nao pode ser negativo (piso em 0)
- Aplicacoes bloqueadas se estoque insuficiente

### Projecao de Medicacao
```
aplicacoesRestantes = mgRestantes / doseAtual
diasRestantes = aplicacoesRestantes * frequenciaDias
dataFimEstimada = hoje + diasRestantes
proximaAplicacao = ultimaAplicacao + frequenciaDias
```

### Indicacao Vigente
- Deve ter `startDate <= hoje`
- Se `durationWeeks` definido, `startDate + durationWeeks > hoje`
- Em caso de multiplas validas, prioriza a mais recente por `startDate`, depois por `createdAt`

### Consultas no Pacote
- Pacote M90 inclui 3 consultas de Endocrino e 2 de Nutri
- Flag `countsInPackage` permite registrar consultas extras que nao contam no pacote

### Alertas
- Calculados em tempo real com base nas metricas do paciente
- Apenas pacientes ACTIVE geram alertas no dashboard
- Severidade: RED (critico), YELLOW (alerta), GREEN (ok)

## Clinicas

O sistema opera com multiplas unidades clinicas. Cada paciente e vinculado a uma clinica, e usuarios podem ser opcionalmente vinculados a uma clinica. Clinicas atuais:

- 01 - Clinica SC Criciuma
- 02 - Clinica SC Curitiba
- 03 - Clinica SC Florianopolis
- 04 - Clinica SC Balneario Camboriu
- 06 - Clinica SC Joinville

## Pacote de Tratamento

O pacote padrao **M90** consiste em:
- **Duracao**: 12 semanas
- **Tirzepatida total**: 90mg
- **Consultas Endocrinologia**: 3
- **Consultas Nutricao**: 2
