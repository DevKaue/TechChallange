import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { ServiceOrdersRepositoryInterface } from './service-orders-repository.interface';
import { ServiceOrderStatus } from '@prisma/client';

@Injectable()
export class ServiceOrdersRepository extends ServiceOrdersRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async create(data: {
    clientId: string;
    vehicleId: string;
    status: ServiceOrderStatus;
  }) {
    return this.prisma.serviceOrder.create({ data });
  }

  async findAll() {
    return this.prisma.serviceOrder.findMany({
      include: { client: true, vehicle: true },
    });
  }

  async findById(id: string) {
    return this.prisma.serviceOrder.findUnique({
      where: { id },
      include: {
        client: true,
        vehicle: true,
        services: { include: { serviceCatalog: true } },
        parts: { include: { part: true } },
      },
    });
  }

  async findVehicleById(vehicleId: string) {
    return this.prisma.vehicle.findUnique({
      where: { id: vehicleId },
      select: { id: true, clientId: true },
    });
  }

  async findServiceCatalogById(id: string) {
    return this.prisma.serviceCatalog.findUnique({
      where: { id },
      select: { id: true, price: true },
    });
  }

  async findPartById(id: string) {
    return this.prisma.part.findUnique({
      where: { id },
      select: { id: true, name: true, price: true, stockQuantity: true },
    });
  }

  async createServiceItem(data: {
    serviceOrderId: string;
    serviceCatalogId: string;
    quantity: number;
    priceAtTime: number;
  }) {
    return this.prisma.serviceOrderItem.create({ data });
  }

  async createPartItem(data: {
    serviceOrderId: string;
    partId: string;
    quantity: number;
    priceAtTime: number;
  }) {
    return this.prisma.serviceOrderPart.create({ data });
  }

  async updatePartStock(partId: string, quantity: number) {
    await this.prisma.part.update({
      where: { id: partId },
      data: { stockQuantity: { decrement: quantity } },
    });
  }

  async findFinishedOrders() {
    return this.prisma.serviceOrder.findMany({
      where: {
        status: {
          in: [ServiceOrderStatus.FINISHED, ServiceOrderStatus.DELIVERED],
        },
        startedExecutionAt: { not: null },
        finishedExecutionAt: { not: null },
      },
      select: { startedExecutionAt: true, finishedExecutionAt: true },
    });
  }

  async updateStatus(
    id: string,
    data: {
      status: ServiceOrderStatus;
      startedExecutionAt?: Date;
      finishedExecutionAt?: Date;
    },
  ) {
    return this.prisma.serviceOrder.update({ where: { id }, data });
  }

  async updateTotalPrice(
    id: string,
    totalPrice: number,
    status: ServiceOrderStatus,
  ) {
    return this.prisma.serviceOrder.update({
      where: { id },
      data: { totalPrice, status },
    });
  }
}
