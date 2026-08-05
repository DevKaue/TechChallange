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
| Plataforma | `access-identity`, `prisma`, `common` | Autenticação, acesso ao banco e validadores compartilhados. |

Fluxo principal da OS:

```text
RECEIVED -> IN_DIAGNOSTICS -> WAITING_APPROVAL -> IN_PROGRESS -> FINISHED -> DELIVERED
```

## Estrutura principal

```text
.
├── prisma/                 # schema, migrations e config do Prisma
├── src/
│   ├── access-identity/    # identidade de acesso, JWT + Passport
│   ├── clients/            # clientes
│   ├── vehicles/           # veículos
│   ├── parts/              # peças e estoque
│   ├── service-catalog/    # catálogo de serviços
│   ├── service-orders/     # ordens de serviço
│   ├── common/validators/  # validadores CPF/CNPJ e placa
│   └── prisma/             # PrismaService global
├── test/                   # testes e2e com Supertest
├── docker-compose.yml      # API, PostgreSQL e perfil opcional do SonarQube
└── sonar-project.properties # configuração do scan SonarQube
```

## Como rodar com Docker (API + Banco)

Pré-requisitos:

- Docker

### 1. Inicialização Básica

Para subir a aplicação completa (API e Banco de Dados) já executando as migrations e os dados iniciais (*seed*), rode o comando abaixo na raiz do projeto:

```bash
docker compose up --build
```

### 2. Documentação API

http://localhost:3000/api/docs

## Autenticação

As rotas administrativas usam Bearer Token JWT. Autentique um usuário interno em:

```text
POST /auth/login
```

Payload:

```json
{
  "email": "ana.santos@oficina.com",
  "password": "Tech@123"
}
```

O endpoint legado abaixo continua disponível com o mesmo payload:

```text
POST /auth/login-admin
```

Depois envie o header:

```text
Authorization: Bearer <TOKEN>
```

Também é possível consultar a identidade autenticada em:

```text
GET /auth/me
```

A consulta pública de acompanhamento da OS fica em:

```text
GET /service-orders/:id
```

## Testes e qualidade

### Entre no container 
```bash
docker compose exec -it api sh
npm run test:all
npm run test:all:cov
```
- Depois abra o arquivo `coverage/lcov-report/index.html` no seu navegador
