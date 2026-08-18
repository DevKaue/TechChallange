variable "project_name" {
  description = "Nome do projeto usado em labels dos recursos."
  type        = string
  default     = "techchallenge"
}

variable "app_name" {
  description = "Nome curto da aplicacao usado nos recursos Kubernetes."
  type        = string
  default     = "oficina-api"
}

variable "cluster_name" {
  description = "Nome do cluster Kind criado pelo Terraform."
  type        = string
  default     = "techchallenge-fase2"
}

variable "kind_node_image" {
  description = "Imagem dos nodes Kubernetes usados pelo Kind."
  type        = string
  default     = "kindest/node:v1.30.2"
}

variable "worker_nodes" {
  description = "Quantidade de nodes worker para simular capacidade horizontal localmente."
  type        = number
  default     = 2

  validation {
    condition     = var.worker_nodes >= 0 && var.worker_nodes <= 5 && var.worker_nodes == floor(var.worker_nodes)
    error_message = "worker_nodes deve ser um inteiro entre 0 e 5."
  }
}

variable "kubeconfig_path" {
  description = "Arquivo kubeconfig escrito pelo provider Kind."
  type        = string
  default     = "./.terraform/kubeconfig"
}

variable "namespace" {
  description = "Namespace Kubernetes que recebera a aplicacao e o banco."
  type        = string
  default     = "techchallenge"
}

variable "application_port" {
  description = "Porta HTTP usada pela API NestJS dentro do container."
  type        = number
  default     = 3000
}

variable "application_node_port" {
  description = "NodePort esperado para expor a API quando os manifestos Kubernetes forem aplicados."
  type        = number
  default     = 30080

  validation {
    condition     = var.application_node_port >= 30000 && var.application_node_port <= 32767
    error_message = "application_node_port deve estar entre 30000 e 32767."
  }
}

variable "host_application_port" {
  description = "Porta local mapeada pelo Kind para acessar a API publicada via NodePort."
  type        = number
  default     = 8080

  validation {
    condition     = var.host_application_port > 0 && var.host_application_port <= 65535
    error_message = "host_application_port deve estar entre 1 e 65535."
  }
}

variable "node_env" {
  description = "Valor da variavel NODE_ENV entregue para os manifests da aplicacao."
  type        = string
  default     = "production"
}

variable "jwt_secret" {
  description = "JWT_SECRET da aplicacao. Quando nulo, o Terraform gera um valor aleatorio."
  type        = string
  default     = null
  sensitive   = true
  nullable    = true

  validation {
    condition     = var.jwt_secret == null || length(var.jwt_secret) >= 32
    error_message = "jwt_secret deve ter pelo menos 32 caracteres quando informado."
  }
}

variable "password_salt" {
  description = "PASSWORD_SALT usado pelo hasher de senhas. Quando nulo, o Terraform gera um valor aleatorio."
  type        = string
  default     = null
  sensitive   = true
  nullable    = true

  validation {
    condition     = var.password_salt == null || length(var.password_salt) >= 32
    error_message = "password_salt deve ter pelo menos 32 caracteres quando informado."
  }
}

variable "postgres_image" {
  description = "Imagem do PostgreSQL usada pelo Deployment do banco."
  type        = string
  default     = "postgres:15-alpine"
}

variable "database_name" {
  description = "Nome do banco principal da aplicacao."
  type        = string
  default     = "oficinadb"
}

variable "database_username" {
  description = "Usuario administrador do PostgreSQL da aplicacao."
  type        = string
  default     = "admin"
}

variable "database_password" {
  description = "Senha do PostgreSQL. Quando nula, o Terraform gera um valor aleatorio."
  type        = string
  default     = null
  sensitive   = true
  nullable    = true

  validation {
    condition     = var.database_password == null || length(var.database_password) >= 12
    error_message = "database_password deve ter pelo menos 12 caracteres quando informado."
  }
}

variable "database_storage_size" {
  description = "Tamanho do PersistentVolumeClaim do PostgreSQL."
  type        = string
  default     = "1Gi"
}

variable "database_storage_class_name" {
  description = "StorageClass do PVC. Use null para a StorageClass default do cluster."
  type        = string
  default     = null
  nullable    = true
}

variable "database_cpu_request" {
  description = "CPU request do container PostgreSQL."
  type        = string
  default     = "100m"
}

variable "database_memory_request" {
  description = "Memory request do container PostgreSQL."
  type        = string
  default     = "128Mi"
}

variable "database_cpu_limit" {
  description = "CPU limit do container PostgreSQL."
  type        = string
  default     = "500m"
}

variable "database_memory_limit" {
  description = "Memory limit do container PostgreSQL."
  type        = string
  default     = "512Mi"
}
