import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { ServiceOrdersRepositoryInterface } from './service-orders-repository.interface';
import {
  ServiceOrderStatus,
  EstimateStatus,
  ServiceOrderItemType,
} from '@prisma/client';

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
        mechanic: { select: { id: true, name: true, role: true } },
        estimates: { include: { items: true } },
        statusHistory: { orderBy: { changedAt: 'asc' } },
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

  async findUserById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, role: true },
    });
  }

  async updateStatus(id: string, status: ServiceOrderStatus) {
    return this.prisma.serviceOrder.update({ where: { id }, data: { status } });
  }

  async assignMechanic(id: string, mechanicId: string) {
    return this.prisma.serviceOrder.update({
      where: { id },
      data: { mechanicId },
    });
  }

  async setClosedAt(id: string, date: Date) {
    return this.prisma.serviceOrder.update({
      where: { id },
      data: { closedAt: date },
    });
  }

  async updateMechanicAvailability(userId: string, available: boolean) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { available },
    });
  }

  async createStatusHistory(data: {
    serviceOrderId: string;
    previousStatus: ServiceOrderStatus | null;
    newStatus: ServiceOrderStatus;
    changedBy?: string;
    notes?: string;
  }) {
    return this.prisma.serviceOrderStatusHistory.create({ data });
  }

  async createEstimate(data: {
    serviceOrderId: string;
    status: EstimateStatus;
    totalAmount: number;
  }) {
    return this.prisma.estimate.create({ data });
  }

  async addEstimateItem(data: {
    estimateId: string;
    itemType: ServiceOrderItemType;
    referenceId: string;
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }) {
    return this.prisma.estimateItem.create({ data });
  }

  async updateEstimateStatus(
    id: string,
    status: EstimateStatus,
    approvedAt?: Date,
  ) {
    return this.prisma.estimate.update({
      where: { id },
      data: { status, ...(approvedAt ? { approvedAt } : {}) },
    });
  }

  async updatePartStock(partId: string, quantity: number) {
    await this.prisma.part.update({
      where: { id: partId },
      data: { stockQuantity: { decrement: quantity } },
    });
  }

  async transaction<T>(
    fn: (tx: ServiceOrdersRepositoryInterface) => Promise<T>,
  ): Promise<T> {
    return this.prisma.$transaction(async () => {
      return fn(this);
    });
  }

  async findExecutionTimes() {
    const history = await this.prisma.serviceOrderStatusHistory.findMany({
      where: {
        newStatus: {
          in: [ServiceOrderStatus.IN_EXECUTION, ServiceOrderStatus.FINISHED],
        },
      },
      select: {
        serviceOrderId: true,
        newStatus: true,
        changedAt: true,
      },
      orderBy: { changedAt: 'asc' },
    });

    const orderTimes = new Map<string, { startTime?: Date; endTime?: Date }>();

    for (const entry of history) {
      const current = orderTimes.get(entry.serviceOrderId) || {};
      if (entry.newStatus === ServiceOrderStatus.IN_EXECUTION) {
        current.startTime = entry.changedAt;
      } else if (entry.newStatus === ServiceOrderStatus.FINISHED) {
        current.endTime = entry.changedAt;
      }
      orderTimes.set(entry.serviceOrderId, current);
    }

    return Array.from(orderTimes.values()).filter(
      (t): t is { startTime: Date; endTime: Date } =>
        t.startTime != null && t.endTime != null,
    );
  }
}
