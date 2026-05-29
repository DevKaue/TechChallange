# Tech Challenge - Sistema de Oficina Mecânica

Base de backend para o MVP da Fase 1 do Tech Challenge. O objetivo desta base é entregar uma fundação clara para o time evoluir: API NestJS modular, banco PostgreSQL com Prisma, autenticação JWT, documentação Swagger, testes automatizados, Docker Compose e configuração inicial de SonarQube.

## Contexto do projeto

O sistema atende uma oficina mecânica de médio porte que precisa sair de controles manuais e centralizar:

- cadastro de clientes e veículos;
- abertura e acompanhamento de ordens de serviço;
- catálogo de serviços de mão de obra;
- controle de peças e estoque;
- aprovação de orçamentos;
- histórico e métricas operacionais.

A modelagem foi alinhada com as notas do Obsidian em `Pessoal/Pós Graduação/Fase 1 - Tech Challenge`, principalmente os documentos de desafio, DDD, linguagem ubíqua e arquitetura do MVP.

## Stack definida

| Camada | Tecnologia | Justificativa |
|---|---|---|
| Linguagem | TypeScript | Tipagem estática reduz bugs e é amplamente adotada no ecossistema Node.js. |
| Framework back-end | NestJS | Arquitetura modular nativa, suporte a DDD, injeção de dependência e decorators. |
| Banco de dados | PostgreSQL | Relacional robusto, ideal para OS, clientes, peças, estoque e históricos. |
| ORM | Prisma | Migrations simples, client type-safe e integração direta com NestJS. |
| Autenticação | JWT + Passport.js | Padrão de mercado e suporte nativo no NestJS. |
| Documentação API | Swagger (`@nestjs/swagger`) | Geração automática a partir de decorators e DTOs do NestJS. |
| Testes | Jest + Supertest | Testes unitários e de integração, integrados ao NestJS por padrão. |
| Containerização | Docker + Docker Compose | Orquestração local da API e banco PostgreSQL. |
| Segurança / scan | SonarQube | SAST, cobertura, vulnerabilidades e code smells em um único painel. |
| Controle de versão | Git + GitHub | Base preparada para repositório privado e colaboração do time. |

## Arquitetura

O MVP segue um monólito modular. A aplicação fica em um único deploy, mas os módulos refletem os bounded contexts do domínio para facilitar manutenção e futura separação, caso necessário.

| Bounded context | Módulos | Responsabilidade |
|---|---|---|
| Administrativo / Core Data | `clients`, `vehicles`, `service-catalog` | Manter os cadastros-base usados pelas ordens de serviço. |
| Operação / Atendimento | `service-orders` | Criar OS, controlar status, itens, orçamento e métricas de execução. |
| Estoque | `parts` | Controlar peças, insumos e saldo disponível para uso em OS. |
| Plataforma | `auth`, `prisma`, `common` | Autenticação, acesso ao banco e validadores compartilhados. |

Fluxo principal da OS:

```text
RECEIVED -> IN_DIAGNOSTICS -> WAITING_APPROVAL -> IN_PROGRESS -> FINISHED -> DELIVERED
```

## Estrutura principal

```text
.
├── backend/
│   ├── prisma/                 # schema, migrations e config do Prisma
│   ├── src/
│   │   ├── auth/               # JWT + Passport
│   │   ├── clients/            # clientes
│   │   ├── vehicles/           # veículos
│   │   ├── parts/              # peças e estoque
│   │   ├── service-catalog/    # catálogo de serviços
│   │   ├── service-orders/     # ordens de serviço
│   │   ├── common/validators/  # validadores CPF/CNPJ e placa
│   │   └── prisma/             # PrismaService global
│   └── test/                   # testes e2e com Supertest
├── docker-compose.yml          # API, PostgreSQL e perfil opcional do SonarQube
└── sonar-project.properties    # configuração do scan SonarQube
```

## Como rodar localmente

Pré-requisitos:

- Node.js 22+
- npm
- Docker e Docker Compose

Suba o PostgreSQL:

```bash
docker compose up -d db
```

Prepare o backend:

```bash
cd backend
cp .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate:dev
npm run start:dev
```

A API fica em `http://localhost:3000`.

Swagger:

```text
http://localhost:3000/api/docs
```

## Docker

Para subir API e banco por Docker Compose:

```bash
docker compose up --build
```

Em uma base nova, aplique as migrations no banco antes de usar a API:

```bash
cd backend
npm run prisma:migrate:deploy
```

## Autenticação

As rotas administrativas usam Bearer Token JWT. Gere um token em:

```text
POST /auth/login-admin
```

Depois envie o header:

```text
Authorization: Bearer <TOKEN>
```

A consulta pública de acompanhamento da OS fica em:

```text
GET /service-orders/:id
```

## Testes e qualidade

```bash
cd backend
npm test
npm run test:cov
npm run build
```

Para subir o SonarQube local:

```bash
docker compose --profile quality up -d sonarqube
```

Depois acesse `http://localhost:9000`, gere um token e rode o scanner apontando para este repositório. Antes do scan, gere cobertura:

```bash
cd backend
npm run test:cov
cd ..
```

Exemplo usando o scanner via Docker no Linux:

```bash
docker run --rm --network host -v "$PWD:/usr/src" -w /usr/src sonarsource/sonar-scanner-cli -Dsonar.host.url=http://localhost:9000 -Dsonar.token=<TOKEN>
```

Observação: em algumas máquinas o SonarQube exige ajustar `vm.max_map_count` no host antes de iniciar.

## Referências do domínio

Os documentos de apoio do DDD continuam no repositorio e no Obsidian:

- `DDD_Documentacao.md`
- `LinguagemUbiqua_GestaoClientes.md`
- `Pessoal/Pós Graduação/Fase 1 - Tech Challenge` no vault do Obsidian
