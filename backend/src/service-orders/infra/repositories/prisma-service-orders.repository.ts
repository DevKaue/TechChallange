import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import {
  ServiceOrdersRepositoryInterface,
  ServiceOrderUpdateData,
} from '@service-orders/domain/contracts/service-orders-repository.interface';
import {
  ServiceOrderStatus,
  EstimateStatus,
  ServiceOrderItemType,
} from '@prisma/client';

@Injectable()
export class PrismaServiceOrdersRepository extends ServiceOrdersRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async create(data: {
    customerId: string;
    vehicleId: string;
    status: ServiceOrderStatus;
  }) {
    return this.prisma.serviceOrder.create({ data });
  }

  async findAll() {
    return this.prisma.serviceOrder.findMany({
      include: { customer: true, vehicle: true },
    });
  }

  async findById(id: string) {
    return this.prisma.serviceOrder.findUnique({
      where: { id },
      include: {
        customer: true,
        vehicle: true,
        mechanic: { select: { id: true, name: true, role: true } },
        estimates: { include: { items: true } },
        statusHistory: { orderBy: { changedAt: 'asc' } },
      },
    });
  }

  async update(id: string, data: ServiceOrderUpdateData) {
    return this.prisma.serviceOrder.update({ where: { id }, data });
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

  async recalcEstimateTotal(estimateId: string) {
    const aggregate = await this.prisma.estimateItem.aggregate({
      where: { estimateId },
      _sum: { totalPrice: true },
    });

    return this.prisma.estimate.update({
      where: { id: estimateId },
      data: { totalAmount: aggregate._sum.totalPrice ?? 0 },
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
