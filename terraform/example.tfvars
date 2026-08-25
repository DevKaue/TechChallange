# Copie para terraform.tfvars (gitignored) e ajuste.
# Nenhuma senha aqui: todas são geradas por random_password e vão direto para o
# Secrets Manager.

region      = "us-east-1"
project     = "techchallenge"
environment = "prod"

# Precisa não colidir com a rede de casa/escritório se um dia houver VPN.
vpc_cidr = "10.0.0.0/16"

kubernetes_version = "1.32"

# t3.medium x2 comporta a API (3 réplicas), o ALB controller e o ESO.
node_instance_types = ["t3.medium"]
node_group_size = {
  min     = 2
  max     = 4
  desired = 2
}

db_instance_class    = "db.t4g.micro"
db_allocated_storage = 20

# Vazio desliga a role de deploy por OIDC.
github_repository = "DevKaue/TechChallange"

# ARNs de IAM que também devem ser admin do cluster (além de quem roda o apply).
cluster_admin_arns = []

# ARNs de IAM com leitura no namespace (pods, logs, HPA) e SEM acesso a Secrets.
# Ex.: ["arn:aws:iam::123456789012:role/dev"]
cluster_readonly_arns = []
