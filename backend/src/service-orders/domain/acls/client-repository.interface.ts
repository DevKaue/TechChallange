/**
 * @context customer-management
 *
 * Contrato que service-orders espera do bounded context customer-management.
 *
 * Responsabilidade do contexto customer-management:
 *   - Implementar esta interface em PrismaClientRepository
 *   - Registrar CLIENT_REPOSITORY como provider no CustomerManagementModule
 *   - Exportar o provider para que outros módulos possam injetá-lo
 */

export const CLIENT_REPOSITORY = Symbol('CLIENT_REPOSITORY');

export interface ClientRepository {
  findById(id: string): Promise<{
    id: string;
    document: string;
    name: string;
    email: string | null;
    phone: string | null;
  } | null>;
}
