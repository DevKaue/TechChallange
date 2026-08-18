resource "kind_cluster" "tech_challenge" {
  name            = var.cluster_name
  node_image      = var.kind_node_image
  kubeconfig_path = local.kubeconfig_path
  wait_for_ready  = true

  kind_config {
    kind        = "Cluster"
    api_version = "kind.x-k8s.io/v1alpha4"

    node {
      role = "control-plane"

      extra_port_mappings {
        container_port = var.application_node_port
        host_port      = var.host_application_port
        protocol       = "TCP"
      }
    }

    dynamic "node" {
      for_each = range(var.worker_nodes)

      content {
        role = "worker"
      }
    }
  }
}
