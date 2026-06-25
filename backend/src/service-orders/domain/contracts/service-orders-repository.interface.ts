// Apenas tipos (apagados na compilação): o domínio não tem dependência de
// runtime de @prisma/client. As shapes abaixo descrevem o formato de
// persistência retornado pelos repositórios.
import type {
  ServiceOrder,
  Estimate,
  EstimateItem,
  ServiceOrderStatusHistory,
} from '@prisma/client';
import { EstimateStatus } from '@service-orders/domain/enums/estimate-status.enum';
import { ServiceOrderStatus } from '@service-orders/domain/enums/service-order-status.enum';
import { ServiceOrderItemType } from '@service-orders/domain/enums/service-order-item-type.enum';

type EstimateWithItems = Estimate & {
  items: EstimateItem[];
};

type ServiceOrderWithRelations = ServiceOrder & {
  customer: {
    id: string;
    document: string;
    email: string | null;
    phone: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
  vehicle: {
    id: string;
    plate: string;
    brand: string;
    model: string;
    year: number;
    customerId: string;
    createdAt: Date;
    updatedAt: Date;
  };
  mechanic: {
    id: string;
    name: string;
    role: string;
  } | null;
  closedAt: Date | null;
  estimates: EstimateWithItems[];
  statusHistory: ServiceOrderStatusHistory[];
};

export type ServiceOrderUpdateData = {
  status?: ServiceOrderStatus;
  mechanicId?: string | null;
  closedAt?: Date | null;
};

export abstract class ServiceOrdersRepositoryInterface {
  abstract create(data: {
    customerId: string;
    vehicleId: string;
    status: ServiceOrderStatus;
  }): Promise<ServiceOrder>;

  abstract findAll(): Promise<ServiceOrder[]>;

  abstract findById(id: string): Promise<ServiceOrderWithRelations | null>;

  abstract update(
    id: string,
    data: ServiceOrderUpdateData,
  ): Promise<ServiceOrder>;

  abstract createStatusHistory(data: {
    serviceOrderId: string;
    previousStatus: ServiceOrderStatus | null;
    newStatus: ServiceOrderStatus;
    changedBy?: string;
    notes?: string;
  }): Promise<ServiceOrderStatusHistory>;

  abstract createEstimate(data: {
    serviceOrderId: string;
    status: EstimateStatus;
    totalAmount: number;
  }): Promise<Estimate>;

  abstract addEstimateItem(data: {
    estimateId: string;
    itemType: ServiceOrderItemType;
    referenceId: string;
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }): Promise<EstimateItem>;

  abstract updateEstimateStatus(
    id: string,
    status: EstimateStatus,
    approvedAt?: Date,
  ): Promise<Estimate>;

  /**
   * Recalcula o totalAmount do orçamento somando o totalPrice de todos os
   * seus itens e persiste o valor agregado.
   */
  abstract recalcEstimateTotal(estimateId: string): Promise<Estimate>;

  abstract findExecutionTimes(): Promise<
    Array<{ startTime: Date; endTime: Date }>
  >;
}
