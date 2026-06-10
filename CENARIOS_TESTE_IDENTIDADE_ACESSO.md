# Cenarios de Teste - Identidade de Acesso

Este arquivo serve como roteiro manual para validar a identidade de acesso implementada no backend e para subir a aplicacao localmente.

## Escopo Validado

- Login com usuario interno real pelo endpoint `POST /api/auth/login`.
- Compatibilidade do endpoint legado `POST /api/auth/login-admin`.
- Emissao de JWT com identidade do usuario.
- Consulta da identidade autenticada via `GET /api/auth/me`.
- Bloqueio de rotas administrativas sem token.
- Acesso a rotas administrativas com token valido.
- Rota publica de acompanhamento de OS via `GET /api/service-orders/:id`.

Observacao: nesta entrega o controle e por autenticacao. Nao ha bloqueio granular por papel (`MECHANIC` ou `ATTENDANT`) nas rotas protegidas.

## Como Rodar Localmente

### Pre-requisitos

- Node.js 22 ou superior.
- npm.
- Docker e Docker Compose.

### Fluxo recomendado: backend local e PostgreSQL no Docker

Execute na raiz do projeto:

```bash
docker compose up -d db
```

Depois prepare e suba o backend:

```bash
cd backend
test -f .env || cp .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate:deploy
npm run prisma:seed
set -a
source .env
set +a
npm run start:dev
```

Se o arquivo `.env` ja existir, o comando acima mantem o arquivo atual. Apenas confira se `DATABASE_URL`, `JWT_SECRET` e `PORT` estao preenchidos.

A API fica disponivel em:

```text
http://localhost:3000/api
```

Swagger:

```text
http://localhost:3000/api/docs
```

### Reset local do banco

Use quando quiser voltar para os dados iniciais do seed. Execute na raiz:

```bash
docker compose down -v
docker compose up -d db
```

Depois, dentro de `backend`:

```bash
npm run prisma:migrate:deploy
npm run prisma:seed
```

### Dados criados pelo seed

Usuarios internos:

| Nome | Email | Papel | Senha |
|---|---|---|---|
| Ana Santos | `ana.santos@oficina.com` | `ATTENDANT` | `Tech@123` |
| Joao Silva | `joao.silva@oficina.com` | `MECHANIC` | `Tech@123` |
| Carlos Oliveira | `carlos.oliveira@oficina.com` | `MECHANIC` | `Tech@123` |

O seed tambem cria clientes, veiculos, pecas e servicos de catalogo para testes locais.

## Preparacao Para Testes Manuais

Defina a URL base no terminal:

```bash
export BASE_URL="http://localhost:3000/api"
```

Para obter um token e salvar na variavel `TOKEN`:

```bash
export TOKEN=$(curl -s -X POST "$BASE_URL/auth/login" -H "Content-Type: application/json" -d '{"email":"ana.santos@oficina.com","password":"Tech@123"}' | node -pe "const fs=require('fs'); JSON.parse(fs.readFileSync(0, 'utf8')).access_token")
```

Para conferir se a variavel foi preenchida:

```bash
echo "$TOKEN"
```

Nos testes via Swagger, execute `POST /api/auth/login`, copie o `access_token`, clique em `Authorize` e cole o token.

## Cenarios De Identidade E Acesso

### CT-01 - Login valido no endpoint principal

Requisicao:

```bash
curl -i -X POST "$BASE_URL/auth/login" -H "Content-Type: application/json" -d '{"email":"ana.santos@oficina.com","password":"Tech@123"}'
```

Resultado esperado:

- Status HTTP `201`.
- Resposta possui `access_token`.
- `token_type` igual a `Bearer`.
- `expires_in` igual a `3600`.
- Objeto `user` possui `id`, `name`, `email` e `role`.
- A resposta nao possui `password` nem `passwordHash`.

### CT-02 - Login com email em caixa alta

Requisicao:

```bash
curl -i -X POST "$BASE_URL/auth/login" -H "Content-Type: application/json" -d '{"email":"ANA.SANTOS@OFICINA.COM","password":"Tech@123"}'
```

Resultado esperado:

- Status HTTP `201`.
- Resposta emite token normalmente.
- `user.email` retorna `ana.santos@oficina.com`.

### CT-03 - Login pelo endpoint legado

Requisicao:

```bash
curl -i -X POST "$BASE_URL/auth/login-admin" -H "Content-Type: application/json" -d '{"email":"ana.santos@oficina.com","password":"Tech@123"}'
```

Resultado esperado:

- Status HTTP `201`.
- Resposta possui o mesmo formato de `POST /api/auth/login`.
- Fluxos antigos que usavam `login-admin` continuam funcionando.

### CT-04 - Senha incorreta

Requisicao:

```bash
curl -i -X POST "$BASE_URL/auth/login" -H "Content-Type: application/json" -d '{"email":"ana.santos@oficina.com","password":"SenhaErrada123"}'
```

Resultado esperado:

- Status HTTP `401`.
- Nenhum token e retornado.
- A mensagem de erro nao revela se o email existe ou se apenas a senha esta errada.

### CT-05 - Usuario inexistente

Requisicao:

```bash
curl -i -X POST "$BASE_URL/auth/login" -H "Content-Type: application/json" -d '{"email":"nao.existe@oficina.com","password":"Tech@123"}'
```

Resultado esperado:

- Status HTTP `401`.
- Nenhum token e retornado.

### CT-06 - Payload de login invalido

Requisicao:

```bash
curl -i -X POST "$BASE_URL/auth/login" -H "Content-Type: application/json" -d '{"email":"email-invalido","password":"123"}'
```

Resultado esperado:

- Status HTTP `400`.
- Erro de validacao informa problema no email e no tamanho minimo da senha.

### CT-07 - Consultar identidade sem token

Requisicao:

```bash
curl -i "$BASE_URL/auth/me"
```

Resultado esperado:

- Status HTTP `401`.
- A API bloqueia a consulta de identidade sem `Authorization`.

### CT-08 - Consultar identidade com token valido

Requisicao:

```bash
curl -i "$BASE_URL/auth/me" -H "Authorization: Bearer $TOKEN"
```

Resultado esperado:

- Status HTTP `200`.
- Resposta possui `id`, `name`, `email` e `role`.
- Os dados retornados correspondem ao usuario usado no login.
- A resposta nao possui `password` nem `passwordHash`.

### CT-09 - Token invalido

Requisicao:

```bash
curl -i "$BASE_URL/auth/me" -H "Authorization: Bearer token-invalido"
```

Resultado esperado:

- Status HTTP `401`.
- A API rejeita tokens malformados, adulterados ou assinados com segredo diferente.

### CT-10 - Rota administrativa sem token

Requisicao:

```bash
curl -i "$BASE_URL/clients"
```

Resultado esperado:

- Status HTTP `401`.
- A rota fica protegida por `JwtAuthGuard`.

### CT-11 - Rota administrativa com token valido

Requisicao:

```bash
curl -i "$BASE_URL/clients" -H "Authorization: Bearer $TOKEN"
```

Resultado esperado:

- Status HTTP `200`.
- Resposta retorna a lista de clientes criados pelo seed.

Repita a mesma logica em rotas protegidas representativas:

- `GET /api/vehicles`
- `GET /api/parts`
- `GET /api/service-catalog`
- `GET /api/service-orders`
- `GET /api/service-orders/metrics/average-time`

### CT-12 - Criar OS exige token

Primeiro tente sem token:

```bash
curl -i -X POST "$BASE_URL/service-orders" -H "Content-Type: application/json" -d '{"clientId":"00000000-0000-0000-0000-000000000000","vehicleId":"00000000-0000-0000-0000-000000000000"}'
```

Resultado esperado:

- Status HTTP `401`.
- A API bloqueia a abertura de OS sem autenticacao.

### CT-13 - Rota publica de acompanhamento de OS

Obtenha um `clientId` e um `vehicleId` vinculado a ele:

```bash
curl -s "$BASE_URL/vehicles" -H "Authorization: Bearer $TOKEN"
```

Use o `id` do veiculo como `vehicleId` e o `clientId` do mesmo objeto como `clientId`.

Crie uma OS autenticada:

```bash
curl -i -X POST "$BASE_URL/service-orders" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"clientId":"<CLIENT_ID>","vehicleId":"<VEHICLE_ID>"}'
```

Resultado esperado:

- Status HTTP `201`.
- Resposta possui `id` e `status` inicial `RECEIVED`.

Agora consulte a OS sem token:

```bash
curl -i "$BASE_URL/service-orders/<SERVICE_ORDER_ID>"
```

Resultado esperado:

- Status HTTP `200`.
- A OS e retornada sem exigir `Authorization`.
- Isso confirma que apenas a consulta individual de acompanhamento esta publica.

### CT-14 - Listagem de OS continua protegida

Requisicao:

```bash
curl -i "$BASE_URL/service-orders"
```

Resultado esperado:

- Status HTTP `401`.
- A listagem administrativa de OS continua protegida, mesmo com `GET /api/service-orders/:id` publico.

### CT-15 - Token de usuario mecanico tambem autentica

Gere um token para um mecanico:

```bash
export TOKEN_MECANICO=$(curl -s -X POST "$BASE_URL/auth/login" -H "Content-Type: application/json" -d '{"email":"joao.silva@oficina.com","password":"Tech@123"}' | node -pe "const fs=require('fs'); JSON.parse(fs.readFileSync(0, 'utf8')).access_token")
```

Consulte a identidade:

```bash
curl -i "$BASE_URL/auth/me" -H "Authorization: Bearer $TOKEN_MECANICO"
```

Resultado esperado:

- Status HTTP `200`.
- `role` igual a `MECHANIC`.
- O token representa o usuario logado, nao um usuario administrativo fixo.

## Checklist Final

- Login valido retorna token e dados basicos do usuario.
- Login invalido retorna `401`.
- Payload invalido retorna `400`.
- `GET /api/auth/me` exige token.
- Rotas administrativas exigem token.
- Rotas administrativas aceitam token JWT valido.
- `GET /api/service-orders/:id` fica publico.
- Respostas nunca expõem `passwordHash`.

## Testes Automatizados Complementares

Dentro de `backend`, rode:

```bash
npm test
npm run test:cov
npm run build
```

Esses comandos nao substituem os cenarios manuais acima, mas ajudam a validar regressao dos servicos e guards implementados.
