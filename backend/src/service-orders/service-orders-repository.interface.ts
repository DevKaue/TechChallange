import {
  ServiceOrder,
  ServiceOrderItem,
  ServiceOrderPart,
  ServiceOrderStatus,
} from '@prisma/client';

type ServiceOrderWithRelations = ServiceOrder & {
  client: {
    id: string;
    name: string;
    cpfCnpj: string;
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
  services: Array<{
    id: string;
    serviceOrderId: string;
    serviceCatalogId: string;
    quantity: number;
    priceAtTime: number;
    serviceCatalog: {
      id: string;
      name: string;
      description: string | null;
      price: number;
      createdAt: Date;
      updatedAt: Date;
    };
  }>;
  parts: Array<{
    id: string;
    serviceOrderId: string;
    partId: string;
    quantity: number;
    priceAtTime: number;
    part: {
      id: string;
      name: string;
      description: string | null;
      price: number;
      stockQuantity: number;
      createdAt: Date;
      updatedAt: Date;
    };
  }>;
};

export abstract class ServiceOrdersRepositoryInterface {
  abstract create(data: {
    clientId: string;
    vehicleId: string;
    status: ServiceOrderStatus;
  }): Promise<ServiceOrder>;
  abstract findAll(): Promise<ServiceOrder[]>;
  abstract findById(id: string): Promise<ServiceOrderWithRelations | null>;
  abstract findVehicleById(
    vehicleId: string,
  ): Promise<{ id: string; clientId: string } | null>;
  abstract findServiceCatalogById(
    id: string,
  ): Promise<{ id: string; price: number } | null>;
  abstract findPartById(id: string): Promise<{
    id: string;
    name: string;
    price: number;
    stockQuantity: number;
  } | null>;
  abstract createServiceItem(data: {
    serviceOrderId: string;
    serviceCatalogId: string;
    quantity: number;
    priceAtTime: number;
  }): Promise<ServiceOrderItem>;
  abstract createPartItem(data: {
    serviceOrderId: string;
    partId: string;
    quantity: number;
    priceAtTime: number;
  }): Promise<ServiceOrderPart>;
  abstract updatePartStock(partId: string, quantity: number): Promise<void>;
  abstract findFinishedOrders(): Promise<
    Array<{ startedExecutionAt: Date | null; finishedExecutionAt: Date | null }>
  >;
  abstract updateStatus(
    id: string,
    data: {
      status: ServiceOrderStatus;
      startedExecutionAt?: Date;
      finishedExecutionAt?: Date;
    },
  ): Promise<ServiceOrder>;
  abstract updateTotalPrice(
    id: string,
    totalPrice: number,
    status: ServiceOrderStatus,
  ): Promise<ServiceOrder>;
}
