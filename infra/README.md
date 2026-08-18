# Infraestrutura Terraform - Fase 2

Esta pasta atende ao requisito de IaC do Tech Challenge Fase 2. A escolha foi um provisionamento local com Kind para permitir avaliacao sem credenciais de cloud, mantendo a estrutura pronta para evoluir para EKS, AKS ou GKE.

## Recursos criados

- Cluster Kubernetes local com Kind.
- Namespace da aplicacao.
- ConfigMap com `NODE_ENV` e `PORT`.
- Secret da aplicacao com `DATABASE_URL`, `JWT_SECRET` e `PASSWORD_SALT`.
- Secret do PostgreSQL com usuario, senha e nome do banco.
- PersistentVolumeClaim para dados do PostgreSQL.
- Deployment do PostgreSQL com probes e limites de CPU/memoria.
- Service `ClusterIP` para acesso interno ao banco.

## Organizacao dos arquivos

Os arquivos seguem o padrao apresentado nas aulas: providers e versoes em um arquivo proprio, variaveis de entrada separadas, valores locais reutilizaveis, recursos principais e outputs.

| Arquivo | Responsabilidade |
|---|---|
| `providers.tf` | Define a versao minima do Terraform, providers usados e suas versoes. |
| `variables.tf` | Declara as variaveis de entrada, tipos, defaults, validacoes e valores sensiveis. |
| `locals.tf` | Centraliza valores derivados e reutilizados, como labels, nomes e `DATABASE_URL`. |
| `main.tf` | Cria o cluster Kubernetes local com Kind. |
| `database.tf` | Cria namespace, ConfigMap, Secrets, PVC, Deployment e Service do PostgreSQL. |
| `outputs.tf` | Exibe informacoes uteis apos o apply, como kubeconfig, namespace e URL local. |
| `terraform.tfvars.example` | Exemplo de valores customizaveis para o grupo usar como base. |
| `.terraform.lock.hcl` | Trava as versoes dos providers baixadas no `terraform init`. |

O arquivo `terraform.tfstate` fica local e nao deve ser commitado, pois contem o estado da infraestrutura e pode armazenar dados sensiveis. Em um ambiente compartilhado real, o ideal seria usar um backend remoto, como S3, Azure Blob Storage ou Terraform Cloud.

## Pre-requisitos

- Docker em execução, usado pelo Kind para criar o cluster Kubernetes local.
- Terraform `>= 1.6`.
- `kubectl` para inspecionar o cluster apos o apply.

## Como aplicar

```bash
cd infra
terraform init
terraform plan -out=tfplan
terraform apply tfplan
```

O Terraform gera senhas automaticamente quando `database_password`, `jwt_secret` e `password_salt` nao forem informados. Para fixar os valores, copie `terraform.tfvars.example` para `terraform.tfvars` e preencha os campos opcionais.

Fluxo recomendado das aulas:

```bash
terraform init
terraform fmt -recursive
terraform validate
terraform plan -out=tfplan
terraform apply tfplan
terraform output
```

Para destruir o ambiente de estudo:

```bash
terraform destroy
```

## Como validar apos o apply

```bash
export KUBECONFIG="$(terraform output -raw kubeconfig_path)"
export NS="$(terraform output -raw namespace)"
```

Valide o cluster:

```bash
kubectl cluster-info
kubectl get nodes -o wide
```

Valide os recursos criados no namespace:

```bash
kubectl -n "$NS" get all
kubectl -n "$NS" get pvc
kubectl -n "$NS" get configmap
kubectl -n "$NS" get secrets
```

Valide se o PostgreSQL subiu corretamente:

```bash
kubectl -n "$NS" rollout status deployment/oficina-api-postgres --timeout=180s
kubectl -n "$NS" exec deploy/oficina-api-postgres -- pg_isready -U admin -d oficinadb
```

Se o `pg_isready` retornar `accepting connections`, o banco esta saudavel.

Para testar uma conexao real no banco:

```bash
kubectl -n "$NS" run pg-client --rm -it --restart=Never \
  --image=postgres:15-alpine \
  -- psql "$(terraform output -raw database_url)" \
  -c "select current_database(), current_user;"
```

Para ler a `DATABASE_URL` gerada separadamente:

```bash
terraform output -raw database_url
```

Observacao: este Terraform valida cluster, banco, ConfigMap e Secrets da aplicacao. A API so aparecera em `kubectl -n "$NS" get all` depois que os manifestos Kubernetes da aplicacao forem aplicados.

Quando os manifestos Kubernetes da API usarem o Secret `oficina-api-runtime`, o ConfigMap `oficina-api-config` e um Service `NodePort` em `30080`, a API ficara acessivel em:

```bash
terraform output -raw application_local_url
```

## Como destruir

```bash
cd infra
terraform destroy
```

## Observacoes de seguranca

Os valores dos Secrets Kubernetes e das senhas aleatorias ficam no state do Terraform. Para producao, use backend remoto criptografado e controle de acesso ao state.
