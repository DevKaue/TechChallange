# Tech Challenge - Sistema de Oficina Mecânica

Este é o MVP de um Sistema Integrado de Atendimento e Execução de Serviços de uma oficina mecânica. 
Desenvolvido utilizando Node.js com NestJS, PostgreSQL e Prisma ORM, seguindo os princípios de Domain-Driven Design (DDD).

## 🚀 Tecnologias Utilizadas
- **Node.js** & **NestJS** (Framework backend modular e tipado)
- **TypeScript** (Segurança de tipos e orientação a objetos)
- **PostgreSQL** (Banco de dados relacional escolhido para controle rigoroso do transacional)
- **Prisma ORM** (Gerenciamento de schema e queries)
- **Docker & Docker Compose** (Containerização da infraestrutura)
- **Jest** (Testes unitários)

## 🛠️ Como Executar o Projeto Localmente

### Pré-requisitos
- Node.js (v22+)
- NPM ou Yarn
- Docker e Docker Compose (Para rodar o banco de dados localmente)

### Passos de Instalação

1. Clone ou acesse o repositório do projeto.
2. Acesse a pasta do backend e instale as dependências:
   ```bash
   cd backend
   npm install
   ```
3. Inicialize o banco de dados PostgreSQL com Docker:
   ```bash
   docker-compose up -d
   ```
4. Execute as migrations do Prisma para criar as tabelas no banco:
   ```bash
   npx prisma migrate dev --name init
   ```
5. Inicie a aplicação em modo de desenvolvimento:
   ```bash
   npm run start:dev
   ```
A aplicação estará rodando na porta **3000** (`http://localhost:3000`).

## 📚 Documentação (Swagger)
O projeto utiliza o Swagger para documentar todas as rotas da API RESTful.
Após iniciar o servidor, a documentação estará disponível em:
👉 **[http://localhost:3000/api/docs](http://localhost:3000/api/docs)**

## 🛡️ Autenticação & Validações

O sistema possui controle de acesso e validações estritas de dados sensíveis conforme exigido no desafio:
- **Autenticação JWT:** As rotas administrativas (`clients`, `vehicles`, `parts`, `service-catalog`) e a rota de métricas são protegidas por autenticação. O token é obtido efetuando um `POST /auth/login` com email e senha de um usuário interno, e deve ser enviado no cabeçalho `Authorization: Bearer <TOKEN>` (ou inserido na interface do Swagger). O endpoint legado `POST /auth/login-admin` continua disponível com o mesmo payload. A rota de consulta individual de OS (`GET /service-orders/:id`) é pública para acompanhamento dos clientes.
- **Identidade autenticada:** A rota protegida `GET /auth/me` retorna os dados do usuário interno identificado pelo token.
- **Validação de CPF/CNPJ:** Cadastro de clientes valida matematicamente o CPF ou CNPJ conforme o algoritmo de dígitos verificadores oficial brasileiro.
- **Validação de Placas:** Cadastro de veículos valida placas seguindo o padrão Mercosul e o padrão brasileiro tradicional.

Credenciais locais criadas pelo seed:

```json
{
  "email": "ana.santos@oficina.com",
  "password": "Tech@123"
}
```

## 📊 Métricas de Execução

O sistema calcula automaticamente o tempo médio de execução das Ordens de Serviço:
- Ao transitar uma OS para `IN_PROGRESS` (Em Execução), o sistema registra o timestamp de início (`startedExecutionAt`).
- Ao transitar para `FINISHED` (Finalizada), o sistema registra o timestamp de término (`finishedExecutionAt`).
- Administradores autenticados podem consultar a média consolidada (em minutos) acessando a rota:
  👉 **`GET /service-orders/metrics/average-time`**

## ✅ Testes Unitários

Para rodar a suite de testes automatizados (com cobertura de 100% de linhas nos domínios e serviços de negócio críticos):
```bash
npm run test
```

Para checar a cobertura de testes detalhada:
```bash
npm run test:cov
```
