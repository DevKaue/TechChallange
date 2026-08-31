output "cluster_name" {
  description = "Nome do cluster EKS. Use em: aws eks update-kubeconfig --name ..."
  value       = module.eks.cluster_name
}

output "region" {
  description = "Região da AWS."
  value       = var.region
}

output "ecr_url" {
  description = "URL do repositório ECR. Destino do docker push e do kustomize edit set image."
  value       = aws_ecr_repository.api.repository_url
}

output "ecr_repository_name" {
  description = "Nome do repositório ECR. Vira a variable ECR_REPOSITORY no GitHub."
  value       = aws_ecr_repository.api.name
}

output "vpc_cidr" {
  description = "CIDR da VPC. Substitui o placeholder 10.0.0.0/16 nas NetworkPolicies do overlay aws."
  value       = module.vpc.vpc_cidr_block
}

output "rds_endpoint" {
  description = "Endpoint do RDS (host:porta)."
  value       = module.rds.db_instance_endpoint
}

output "github_deploy_role_arn" {
  description = "ARN a configurar como AWS_DEPLOY_ROLE nos secrets do repositório GitHub."
  value       = local.github_enabled ? aws_iam_role.github_deploy[0].arn : null
}

output "kubeconfig_command" {
  description = "Comando pronto para apontar o kubectl para este cluster."
  value       = "aws eks update-kubeconfig --name ${module.eks.cluster_name} --region ${var.region}"
}
