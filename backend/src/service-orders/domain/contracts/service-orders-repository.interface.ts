import {
  ServiceOrder,
  Estimate,
  EstimateItem,
  ServiceOrderStatusHistory,
  ServiceOrderItemType,
} from '@prisma/client';
import { EstimateStatus } from '@service-orders/domain/enums/estimate-status.enum';
import { ServiceOrderStatus } from '@service-orders/domain/enums/service-order-status.enum';

type EstimateWithItems = Estimate & {
  items: EstimateItem[];
};

type ServiceOrderWithRelations = ServiceOrder & {
  client: {
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
    clientId: string;
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

export abstract class ServiceOrdersRepositoryInterface {
  abstract create(data: {
    clientId: string;
    vehicleId: string;
    status: ServiceOrderStatus;
  }): Promise<ServiceOrder>;

  abstract findAll(): Promise<ServiceOrder[]>;

  abstract findById(id: string): Promise<ServiceOrderWithRelations | null>;

  abstract updateStatus(
    id: string,
    status: ServiceOrderStatus,
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

  abstract findExecutionTimes(): Promise<
    Array<{ startTime: Date; endTime: Date }>
  >;

  abstract assignMechanic(
    id: string,
    mechanicId: string,
  ): Promise<ServiceOrder>;

  abstract setClosedAt(id: string, date: Date): Promise<ServiceOrder>;

  abstract transaction<T>(
    fn: (
      tx: Omit<ServiceOrdersRepositoryInterface, 'transaction'>,
    ) => Promise<T>,
  ): Promise<T>;
}
