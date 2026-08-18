resource "random_password" "database" {
  length  = 24
  special = false
}

resource "random_password" "jwt_secret" {
  length  = 48
  special = false
}

resource "random_password" "password_salt" {
  length  = 64
  special = false
}

resource "kubernetes_namespace_v1" "app" {
  metadata {
    name   = var.namespace
    labels = local.common_labels
  }

  depends_on = [kind_cluster.tech_challenge]
}

resource "kubernetes_config_map_v1" "application" {
  metadata {
    name      = "${var.app_name}-config"
    namespace = kubernetes_namespace_v1.app.metadata[0].name
    labels    = local.common_labels
  }

  data = {
    NODE_ENV = var.node_env
    PORT     = tostring(var.application_port)
  }
}

resource "kubernetes_secret_v1" "application" {
  metadata {
    name      = "${var.app_name}-runtime"
    namespace = kubernetes_namespace_v1.app.metadata[0].name
    labels    = local.common_labels
  }

  data = {
    DATABASE_URL  = local.database_url
    JWT_SECRET    = local.jwt_secret
    PASSWORD_SALT = local.password_salt
  }

  type = "Opaque"
}

resource "kubernetes_secret_v1" "postgres" {
  metadata {
    name      = "${local.database_name}-credentials"
    namespace = kubernetes_namespace_v1.app.metadata[0].name
    labels    = local.database_labels
  }

  data = {
    POSTGRES_DB       = var.database_name
    POSTGRES_USER     = var.database_username
    POSTGRES_PASSWORD = local.database_password
  }

  type = "Opaque"
}

resource "kubernetes_persistent_volume_claim_v1" "postgres" {
  wait_until_bound = false

  metadata {
    name      = "${local.database_name}-data"
    namespace = kubernetes_namespace_v1.app.metadata[0].name
    labels    = local.database_labels
  }

  spec {
    access_modes       = ["ReadWriteOnce"]
    storage_class_name = var.database_storage_class_name

    resources {
      requests = {
        storage = var.database_storage_size
      }
    }
  }
}

resource "kubernetes_deployment_v1" "postgres" {
  metadata {
    name      = local.database_name
    namespace = kubernetes_namespace_v1.app.metadata[0].name
    labels    = local.database_labels
  }

  spec {
    replicas = 1

    selector {
      match_labels = local.database_labels
    }

    strategy {
      type = "Recreate"
    }

    template {
      metadata {
        labels = local.database_labels
      }

      spec {
        container {
          name              = "postgres"
          image             = var.postgres_image
          image_pull_policy = "IfNotPresent"

          port {
            name           = "postgres"
            container_port = 5432
          }

          env {
            name = "POSTGRES_DB"

            value_from {
              secret_key_ref {
                name = kubernetes_secret_v1.postgres.metadata[0].name
                key  = "POSTGRES_DB"
              }
            }
          }

          env {
            name = "POSTGRES_USER"

            value_from {
              secret_key_ref {
                name = kubernetes_secret_v1.postgres.metadata[0].name
                key  = "POSTGRES_USER"
              }
            }
          }

          env {
            name = "POSTGRES_PASSWORD"

            value_from {
              secret_key_ref {
                name = kubernetes_secret_v1.postgres.metadata[0].name
                key  = "POSTGRES_PASSWORD"
              }
            }
          }

          resources {
            requests = {
              cpu    = var.database_cpu_request
              memory = var.database_memory_request
            }

            limits = {
              cpu    = var.database_cpu_limit
              memory = var.database_memory_limit
            }
          }

          readiness_probe {
            exec {
              command = ["pg_isready", "-U", var.database_username, "-d", var.database_name]
            }

            initial_delay_seconds = 10
            period_seconds        = 10
            timeout_seconds       = 5
            failure_threshold     = 6
          }

          liveness_probe {
            exec {
              command = ["pg_isready", "-U", var.database_username, "-d", var.database_name]
            }

            initial_delay_seconds = 30
            period_seconds        = 20
            timeout_seconds       = 5
            failure_threshold     = 6
          }

          volume_mount {
            name       = "postgres-data"
            mount_path = "/var/lib/postgresql/data"
            sub_path   = "postgres"
          }
        }

        volume {
          name = "postgres-data"

          persistent_volume_claim {
            claim_name = kubernetes_persistent_volume_claim_v1.postgres.metadata[0].name
          }
        }
      }
    }
  }
}

resource "kubernetes_service_v1" "postgres" {
  metadata {
    name      = local.database_service_name
    namespace = kubernetes_namespace_v1.app.metadata[0].name
    labels    = local.database_labels
  }

  spec {
    selector = local.database_labels
    type     = "ClusterIP"

    port {
      name        = "postgres"
      port        = 5432
      target_port = 5432
      protocol    = "TCP"
    }
  }
}
