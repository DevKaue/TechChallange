# Changelog — Tech Challenge

## 2026-06-02 — Refatoração PT-BR → EN + Infraestrutura

### Schema & Banco de Dados
- `Client.cpfCnpj` substituído por `document` + `documentType` (enum: `CPF`, `CNPJ`, `PASSPORT`, `RNE`) com unique composto
- `ServiceOrder.mecanicoId` / `mecanico` → `mechanicId` / `mechanic`
- `ServiceOrder.dataFechamento` → `closedAt`
- 5 migrations aplicadas no PostgreSQL (Docker)
- Seeders idempotentes para users, service_catalog, parts, clients, vehicles

### API
- Global prefix `/api` — rotas em `/api/clients`, `/api/service-orders`, `/api/health`, etc.
- Health check `GET /api/health` com status + uptime + timestamp
- Swagger em `GET /api/docs`

### Arquitetura Backend (NestJS)
- DTOs organizados por contexto (`service-orders/dto/service-order/`, `estimate/`, `diagnosis/`, `mechanic/`)
- Response DTOs com `@ApiProperty()` em todos os módulos
- Global pipes: `ValidationPipe` com whitelist + forbidNonWhitelisted + transform
- Global interceptors: `ClassSerializerInterceptor` + `LoggingInterceptor`
- Global filter: `HttpExceptionFilter`
- Path alias `@/` para imports
- Repository pattern com interface + implementação Prisma + suporte a transação
- Use-case único para service-orders com 10 métodos de negócio

### Autenticação
- `JWT_SECRET` sem fallback — validação via `validateEnv()` no boot
- Health endpoint público (sem JWT)

### Validação
- `cpf-cnpj.validator.ts` → `document.validator.ts`: valida CPF/CNPJ/Passaporte/RNE conforme `documentType`
- Mensagens de erro em EN em todos os validators e services
- Validador de placa com mensagem em EN

### Testes
- 41/41 testes passando (5 suítes)
- Cobertura: app controller, validators (document + plate), clients service, service-orders use-case + controller

### Infraestrutura
- Docker Compose com PostgreSQL 15 + NestJS + SonarQube (profile `quality`)
- Prisma v7 com adapter `@prisma/adapter-pg`
- Container API rebuildado com as mudanças
