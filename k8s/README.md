# Teste local com Minikube

Passo a passo para subir e testar o cluster Kubernetes localmente usando **Minikube** (driver Docker).

## 1. Pré-requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado e **em execução**
- [Minikube](https://minikube.sigs.k8s.io/docs/start/) instalado
- [kubectl](https://kubernetes.io/docs/tasks/tools/) instalado

## 2. Subir o cluster

```bash
# Inicia o Docker Desktop (se ainda não estiver rodando)
# Windows: abra o app "Docker Desktop" ou:
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"

# Aguarde o Docker ficar pronto
docker info --format '{{.ServerVersion}}'

# Cria/sobe o cluster minikube com o driver docker
minikube start --driver=docker --cpus=4 --memory=6144

# Confirma que o kubectl aponta para o minikube
kubectl config current-context   # deve exibir "minikube"
kubectl get nodes
kubectl get sc                   # deve existir a storage class "standard" (hostpath)
```

> O PVC do banco usa a storage class padrão (`standard`). Sem ela, o `db-pvc` ficará pendente.

## 3. Build da imagem da API

A imagem é buildada **dentro do minikube** (as nodes têm acesso a ela via `IfNotPresent`).

```bash
# No diretório raiz do projeto
minikube image build -t techchallenge-api:latest .
```

## 4. Aplicar os manifestos

```bash
kubectl apply -f k8s/app-configmap.yaml
kubectl apply -f k8s/app-secret.yaml
kubectl apply -f k8s/db.yaml
kubectl apply -f k8s/api.yaml
kubectl apply -f k8s/hpa.yaml
```

## 5. Verificar o estado dos recursos

```bash
kubectl get pods,svc,pvc,hpa -o wide
```

O esperado:

- `pod/db-deployment-*` → `1/1 Running` (probe `pg_isready` ok)
- `pod/api-deployment-*` → `1/1 Running` (init container `prisma-migrate` concluído + probes em `/api/health` ok)
- `persistentvolumeclaim/db-pvc` → `Bound`
- `horizontalpodautoscaler.autoscaling/api-hpa` → `TARGETS` com valores (cpu e memory)

Acompanhe o rollout e os logs:

```bash
kubectl rollout status deploy/api-deployment
kubectl rollout status deploy/db-deployment

# Logs da migração (init container)
kubectl logs deploy/api-deployment -c prisma-migrate

# Logs da API
kubectl logs deploy/api-deployment
```

## 6. Expor a API

O Service `api-service` é `LoadBalancer`. No minikube, use **uma** das opções:

**Opção A — `minikube tunnel`** (gera External-IP real):

```bash
minikube tunnel
# em outro terminal:
kubectl get svc api-service   # EXTERNAL-IP preenchido
$API=http://<EXTERNAL-IP>:3000
```

**Opção B — port-forward** (mais simples para teste):

```bash
kubectl port-forward svc/api-service 3000:3000
$API=http://localhost:3000
```

## 7. Testar a API

```bash
# Health check
Invoke-RestMethod -Uri $API/api/health

# Swagger
# abra no navegador: $API/api/docs
```

### 7.1 Seed do banco (dados iniciais)

O banco começa vazio. O seed cria usuários, catálogo de serviços, peças, clientes e veículos.

```bash
# Em um terminal, exponha o banco na porta 5433
kubectl port-forward svc/db-service 5433:5432

# Em outro terminal, no diretório raiz do projeto:
$env:DATABASE_URL='postgresql://admin:adminpassword@localhost:5433/oficinadb'
$env:PASSWORD_SALT='4a7b1e8f9c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f'
npx ts-node prisma/seed.ts
```

> Os valores de `PASSWORD_SALT` e `DATABASE_URL` devem ser os mesmos do `k8s/app-secret.yaml`.

### 7.2 Login

```bash
$body = '{"email":"ana.santos@oficina.com","password":"Tech@123"}'
$login = Invoke-RestMethod -Uri $API/api/auth/login -Method Post -ContentType 'application/json' -Body $body
$login | ConvertTo-Json
```

Usuários criados pelo seed (senha padrão `Tech@123`):

| Email | Perfil |
|-------|--------|
| joao.silva@oficina.com | MECHANIC |
| carlos.oliveira@oficina.com | MECHANIC |
| ana.santos@oficina.com | ATTENDANT |

### 7.3 Endpoint autenticado

```bash
$h = @{ Authorization = "Bearer $($login.access_token)" }
Invoke-RestMethod -Uri $API/api/customers -Headers $h
```

## 8. Validar a persistência (PVC)

Apague o pod do banco e confirme que os dados sobrevivem:

```bash
kubectl delete pod -l app=db
kubectl get pods -l app=db   # aguarde novo pod Running

# Repita o login/GET de clientes — os dados continuam lá
```

## 9. Limpeza

```bash
# Remove os recursos do cluster (dados do PVC incluídos)
kubectl delete -f k8s/api.yaml -f k8s/db.yaml -f k8s/hpa.yaml -f k8s/app-secret.yaml -f k8s/app-configmap.yaml

# Ou derruba o cluster inteiro
minikube stop
minikube delete
```