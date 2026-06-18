/**
 * @context parts
 *
 * Contrato que service-orders espera do bounded context parts.
 *
 * Responsabilidade do contexto parts:
 *   - Implementar esta interface em PrismaPartRepository
 *   - Registrar PART_REPOSITORY como provider no PartsModule
 *   - Exportar o provider para que outros módulos possam injetá-lo
 */

export const PART_REPOSITORY = Symbol('PART_REPOSITORY');

export interface PartRepository {
  findById(id: string): Promise<{
    id: string;
    name: string;
    price: number;
    stockQuantity: number;
  } | null>;

  decrementStock(partId: string, quantity: number): Promise<void>;
}
