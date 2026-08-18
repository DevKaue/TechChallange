locals {
  common_labels = {
    "app.kubernetes.io/name"       = var.app_name
    "app.kubernetes.io/part-of"    = var.project_name
    "app.kubernetes.io/managed-by" = "terraform"
  }

  database_name         = "${var.app_name}-postgres"
  database_service_name = "${var.app_name}-postgres"

  database_labels = merge(local.common_labels, {
    "app.kubernetes.io/component" = "database"
    "app.kubernetes.io/instance"  = local.database_name
  })

  kubeconfig_path = abspath(pathexpand(var.kubeconfig_path))

  database_password = var.database_password != null ? var.database_password : random_password.database.result
  jwt_secret        = var.jwt_secret != null ? var.jwt_secret : random_password.jwt_secret.result
  password_salt     = var.password_salt != null ? var.password_salt : random_password.password_salt.result

  database_url = "postgresql://${var.database_username}:${urlencode(local.database_password)}@${local.database_service_name}:5432/${var.database_name}?schema=public"
}
