output "cluster_name" {
  description = "Nome do cluster Kubernetes local."
  value       = kind_cluster.tech_challenge.name
}

output "kubeconfig_path" {
  description = "Caminho do kubeconfig gerado pelo Terraform."
  value       = local.kubeconfig_path
}

output "namespace" {
  description = "Namespace criado para a solucao."
  value       = kubernetes_namespace_v1.app.metadata[0].name
}

output "application_config_map_name" {
  description = "ConfigMap com variaveis nao sensiveis da API."
  value       = kubernetes_config_map_v1.application.metadata[0].name
}

output "application_secret_name" {
  description = "Secret com DATABASE_URL, JWT_SECRET e PASSWORD_SALT da API."
  value       = kubernetes_secret_v1.application.metadata[0].name
}

output "database_service_name" {
  description = "Service interno do PostgreSQL."
  value       = kubernetes_service_v1.postgres.metadata[0].name
}

output "database_url" {
  description = "DATABASE_URL que deve ser consumida pela API dentro do cluster."
  value       = local.database_url
  sensitive   = true
}

output "application_local_url" {
  description = "URL local prevista para a API quando o Service da aplicacao usar o NodePort configurado."
  value       = "http://localhost:${var.host_application_port}"
}
