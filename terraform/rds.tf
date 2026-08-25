resource "aws_security_group" "rds" {
  name        = "${local.name}-rds"
  description = "Postgres acessivel somente pelos nos do EKS"
  vpc_id      = module.vpc.vpc_id

  tags = local.tags
}

# Ingress apenas do security group dos nós — não por CIDR. Assim o RDS continua
# fechado mesmo que alguém crie outra coisa dentro da mesma VPC.
#
# `aws_vpc_security_group_ingress_rule` e não o antigo `aws_security_group_rule`:
# o recurso legado não aceita tags e sofre drift quando várias regras dividem o
# mesmo security group.
resource "aws_vpc_security_group_ingress_rule" "rds_from_nodes" {
  security_group_id            = aws_security_group.rds.id
  referenced_security_group_id = module.eks.node_security_group_id
  from_port                    = 5432
  to_port                      = 5432
  ip_protocol                  = "tcp"
  description                  = "Postgres a partir dos nos do EKS"

  tags = local.tags
}

resource "random_password" "db" {
  length = 32
  # O DATABASE_URL é uma URL: caracteres que exigiriam percent-encoding viram
  # bug de conexão difícil de achar.
  override_special = "-_"
}

module "rds" {
  source  = "terraform-aws-modules/rds/aws"
  version = "6.13.1"

  identifier = local.name

  engine = "postgres"
  # Mesma major que o Postgres do overlay local e dos composes (15.19-alpine):
  # paridade dev/prod é o ponto de ter ambiente local. Subir para 16 é uma
  # migração deliberada — exige recriar os volumes locais, não é troca de linha.
  engine_version       = "15"
  family               = "postgres15"
  major_engine_version = "15"
  instance_class       = var.db_instance_class

  allocated_storage = var.db_allocated_storage
  # Autoscaling de storage DESLIGADO: o Free Tier limita o armazenamento a 20 GB
  # e crescer além disso seria bloqueado — melhor falhar previsível em 20 GB do
  # que a meio de uma escrita. Numa conta paga, `var.db_allocated_storage * 5`.
  max_allocated_storage = 0
  storage_encrypted     = true

  db_name  = var.db_name
  username = var.db_username
  password = random_password.db.result
  port     = 5432

  manage_master_user_password = false # a senha vai para o Secrets Manager por secrets.tf

  multi_az = false # single-AZ por custo; ver README

  # Subnets privadas: o RDS não tem rota para a internet e só é alcançável de
  # dentro da VPC.
  create_db_subnet_group = true
  subnet_ids             = module.vpc.private_subnets
  vpc_security_group_ids = [aws_security_group.rds.id]

  publicly_accessible = false

  # 0 = sem backup automático. NÃO é escolha de engenharia: contas no Free Tier
  # recusam retenção > 0 com `FreeTierRestrictionError`. Num plano pago, volte
  # para 7 — perder o backup automático de um banco de produção é inaceitável.
  backup_retention_period = 0
  skip_final_snapshot     = true  # permite `terraform destroy` sem prompt
  deletion_protection     = false # idem — em produção real seria true

  performance_insights_enabled = false
  create_monitoring_role       = false

  tags = local.tags
}
