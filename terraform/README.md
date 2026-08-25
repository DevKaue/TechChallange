# Terraform — infraestrutura AWS

Cria tudo que o overlay `k8s/overlays/aws` pressupõe: VPC, ECR, EKS, RDS,
namespace, Secret da aplicação, ALB Controller e a role de deploy do CI.

```
versions.tf           required_version, providers e backend S3
providers.tf          configuração de aws / kubernetes / helm
vpc.tf                VPC 3 AZ, NAT único, TAGS de subnet para o ALB
ecr.tf                repositório com tag imutável e lifecycle
eks.tf                cluster 1.32, managed node group, access entries
addons.tf             vpc-cni (network policy), coredns, kube-proxy,
                      metrics-server, CloudWatch Container Insights
rds.tf                Postgres 15 privado, SG que só aceita dos nós
secrets.tf            namespace + Secret com as 4 chaves de validateEnv()
alb-controller.tf     IRSA + Helm do AWS Load Balancer Controller
github-oidc.tf        OIDC provider e role de deploy (sem chave estática)
```

## Pré-requisitos

- Terraform ~> 1.10 (o backend usa `use_lockfile`, que exige 1.10+)
- AWS CLI v2, `kubectl`, `helm`
- Credenciais com permissão de admin (`aws sts get-caller-identity` responde)

## Bootstrap do backend (uma vez por conta)

O state fica em S3 para que o time compartilhe o mesmo estado e o arquivo — que
contém `DATABASE_URL`, `JWT_SECRET`, `PASSWORD_SALT` e `WEBHOOK_SECRET` em texto
claro — não more no laptop de uma pessoa. O bucket precisa existir **antes** do
primeiro `init`:

```bash
aws s3api create-bucket --bucket techchallenge-fiap-v1 --region us-east-1
# Versionamento é o que permite recuperar um state corrompido ou sobrescrito.
aws s3api put-bucket-versioning --bucket techchallenge-fiap-v1 \
  --versioning-configuration Status=Enabled
aws s3api put-public-access-block --bucket techchallenge-fiap-v1 \
  --public-access-block-configuration "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
```

Locking é nativo do S3 (`use_lockfile = true`) — não há tabela DynamoDB.

## Uso

```bash
cd terraform
cp example.tfvars terraform.tfvars      # gitignored
$EDITOR terraform.tfvars

terraform init
terraform plan -out=tfplan              # LEIA o plano antes
terraform apply tfplan                  # ~20 min (EKS ~10, RDS ~8)

eval "$(terraform output -raw kubeconfig_command)"
kubectl get nodes
```

Depois disso, siga o "Runbook — AWS" em [`../k8s/README.md`](../k8s/README.md).

## Destruir

```bash
terraform plan -destroy -out=tfdestroy    # LEIA o que será apagado
terraform apply tfdestroy
```

Sai limpo de propósito: `skip_final_snapshot`, `deletion_protection = false`,
`force_delete` no ECR. Em produção real os três seriam o inverso — aqui a
prioridade é não deixar recurso órfão queimando crédito.

> ⚠️ **`tfplan` e `tfdestroy` nunca vão para o git.** Um plano salvo guarda os
> valores planejados — `DATABASE_URL`, `JWT_SECRET`, `PASSWORD_SALT` e
> `WEBHOOK_SECRET` em **texto claro**; o de destroy carrega o estado atual
> inteiro. O `.gitignore` cobre os nomes padrão, então use esses nomes.

> Se o `destroy` travar na VPC, quase sempre é um ALB órfão: o Ingress precisa
> ser removido (`kubectl delete -k ../k8s/overlays/aws`) **antes** do destroy,
> senão o Load Balancer Controller deixa o LB para trás e a subnet não some.

## Custo estimado

| Recurso | ~US$/dia |
|---|---|
| EKS control plane | 2,40 |
| 2× c7i-flex.large | 2,00 |
| NAT Gateway | 1,10 |
| RDS db.t4g.micro + 20 GB | 0,70 |
| ALB | 0,60 |
| **Total** | **~7,00** |

Um fim de semana esquecido custa ~US$ 21. `terraform destroy` ao fim de cada
sessão de trabalho.

## Decisões

| Decisão | Motivo |
|---|---|
| Backend S3 com `use_lockfile` | Três pessoas trabalham no repo: state local significaria que só quem aplicou consegue aplicar de novo, e o arquivo com os quatro segredos ficaria num laptop. O bucket é criado uma vez à mão — o chicken-and-egg do backend não tem solução elegante |
| Versões de módulo **exatas** | O `.terraform.lock.hcl` trava providers, **não módulos**. Com `~>`, um `init` numa máquina nova traria versão diferente da validada. Bump vira PR explícito |
| NAT único | ~US$ 32/mês contra ~US$ 96. Se a AZ do NAT cair, os nós das outras perdem saída — aceitável aqui, não em produção real |
| Endpoint público do cluster | Sem ele seria preciso bastion/VPN para `kubectl`. Continua autenticado por IAM e autorizado por RBAC |
| Access entries, não `aws-auth` | O ConfigMap está em depreciação |
| `enableNetworkPolicy` no VPC CNI | Sem esta flag as NetworkPolicies são **aceitas e não aplicadas** — a mesma armadilha do Docker Desktop |
| `metrics-server` como addon | Não vem por padrão no EKS; sem ele o HPA fica `<unknown>` e a escalabilidade não funciona |
| Container Insights em vez de EFK | Um addon contra ~200 linhas de YAML de Elasticsearch/Fluentd/Kibana. Mesma pergunta respondida (métricas e logs), muito menos peça móvel |
| Senhas via `random_password` | Nenhum segredo em `.tfvars` nem no git |
| Secret do K8s pelo Terraform, sem External Secrets | Para UM Secret de QUATRO chaves, o ESO custaria um operator, um CRD, uma role IRSA e um `kubectl apply` manual. E "não guardar segredo no state" não se aplica: as senhas são geradas aqui. Se um dia precisar rotacionar sem `terraform apply`, o ESO passa a valer o preço |
| Namespace criado aqui, não pelo Kustomize | O Secret precisa do namespace antes, e o Terraform roda primeiro. O overlay `local` continua criando o seu |
| Single-AZ no RDS | Multi-AZ dobra o custo |
| Postgres **15**, não 16 | Mesma major do Postgres local e dos composes — paridade dev/prod. Subir para 16 é migração deliberada, exige recriar os volumes locais |
| `c7i-flex.large` nos nós | Contas no AWS Free Tier **bloqueiam** tipos fora da faixa gratuita; `t3.medium` falha na criação do node group. Mesmos 2 vCPU / 4 GiB |
| `backup_retention_period = 0` | Imposição do Free Tier, **não** escolha de engenharia: retenção > 0 é recusada. Num plano pago, volte para 7 |
| Role do CI restrita ao repo | A condição `sub = repo:owner/repo:*` impede que outro repositório assuma a role |

### Dívidas conscientes

- **A role de deploy é cluster-admin dentro do EKS.** O `apply -k` cria
  namespace, RBAC e recursos de CRD; restringir exigiria enumerar cada verbo.
  Aceitável porque só este repositório assume a role.
- **`PASSWORD_SALT` é gerado pelo Terraform.** Ele é estável no state, mas um
  `destroy`/`apply` gera outro e **invalida todas as senhas já gravadas**. Se
  o banco tiver dados reais, mova o valor para fora do ciclo de vida do
  Terraform antes.
- **Sem TLS por padrão.** O ALB sobe em HTTP; HTTPS exige domínio + certificado
  ACM. Ver o comentário em `k8s/overlays/aws/ingress.yaml`.
- **`terraform destroy` não apaga o bucket de state.** Ele é criado fora do
  Terraform de propósito — apagá-lo junto destruiria o histórico de versões que
  serve justamente para recuperar de um destroy indevido.
