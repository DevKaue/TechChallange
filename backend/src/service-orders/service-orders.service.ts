import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceOrderDto } from './dto/create-service-order.dto';
import { UpdateServiceOrderStatusDto } from './dto/update-service-order-status.dto';
import { AddItemToOrderDto } from './dto/add-item-to-order.dto';
import { ServiceOrderStatus } from '@prisma/client';

@Injectable()
export class ServiceOrdersService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateServiceOrderDto) {
    // Validate that client and vehicle exist and the vehicle belongs to the client
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: createDto.vehicleId },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    if (vehicle.clientId !== createDto.clientId) {
      throw new ConflictException('Vehicle does not belong to the specified client');
    }

    return this.prisma.serviceOrder.create({
      data: {
        clientId: createDto.clientId,
        vehicleId: createDto.vehicleId,
        status: ServiceOrderStatus.RECEIVED,
      },
    });
  }

  async findAll() {
    return this.prisma.serviceOrder.findMany({
      include: {
        client: true,
        vehicle: true,
      },
    });
  }

  async findOne(id: string) {
    const serviceOrder = await this.prisma.serviceOrder.findUnique({
      where: { id },
      include: {
        client: true,
        vehicle: true,
        services: { include: { serviceCatalog: true } },
        parts: { include: { part: true } },
      },
    });

    if (!serviceOrder) {
      throw new NotFoundException(`Service Order ${id} not found`);
    }

    return serviceOrder;
  }

  async updateStatus(id: string, updateDto: UpdateServiceOrderStatusDto) {
    const serviceOrder = await this.findOne(id);
    
    const dataToUpdate: any = { status: updateDto.status };

    if (updateDto.status === ServiceOrderStatus.IN_PROGRESS && !serviceOrder.startedExecutionAt) {
      dataToUpdate.startedExecutionAt = new Date();
    } else if (updateDto.status === ServiceOrderStatus.FINISHED && !serviceOrder.finishedExecutionAt) {
      dataToUpdate.finishedExecutionAt = new Date();
    }

    return this.prisma.serviceOrder.update({
      where: { id },
      data: dataToUpdate,
    });
  }

  async addService(orderId: string, addDto: AddItemToOrderDto) {
    const serviceOrder = await this.findOne(orderId);
    
    if (serviceOrder.status !== ServiceOrderStatus.RECEIVED && serviceOrder.status !== ServiceOrderStatus.IN_DIAGNOSTICS) {
      throw new BadRequestException('Cannot add services to an order that is already approved or further.');
    }

    const catalogService = await this.prisma.serviceCatalog.findUnique({
      where: { id: addDto.itemId },
    });

    if (!catalogService) {
      throw new NotFoundException('Service not found in catalog');
    }

    return this.prisma.serviceOrderItem.create({
      data: {
        serviceOrderId: orderId,
        serviceCatalogId: catalogService.id,
        quantity: addDto.quantity,
        priceAtTime: catalogService.price,
      },
    });
  }

  async addPart(orderId: string, addDto: AddItemToOrderDto) {
    const serviceOrder = await this.findOne(orderId);
    
    if (serviceOrder.status !== ServiceOrderStatus.RECEIVED && serviceOrder.status !== ServiceOrderStatus.IN_DIAGNOSTICS) {
      throw new BadRequestException('Cannot add parts to an order that is already approved or further.');
    }

    const part = await this.prisma.part.findUnique({
      where: { id: addDto.itemId },
    });

    if (!part) {
      throw new NotFoundException('Part not found');
    }

    if (part.stockQuantity < addDto.quantity) {
      throw new ConflictException(`Insufficient stock for part ${part.name}. Available: ${part.stockQuantity}`);
    }

    // Decrement stock
    await this.prisma.part.update({
      where: { id: part.id },
      data: { stockQuantity: { decrement: addDto.quantity } },
    });

    return this.prisma.serviceOrderPart.create({
      data: {
        serviceOrderId: orderId,
        partId: part.id,
        quantity: addDto.quantity,
        priceAtTime: part.price,
      },
    });
  }

  async generateBudget(id: string) {
    const order = await this.findOne(id);

    const servicesTotal = order.services.reduce((acc: number, item: any) => acc + (item.priceAtTime * item.quantity), 0);
    const partsTotal = order.parts.reduce((acc: number, item: any) => acc + (item.priceAtTime * item.quantity), 0);

    const totalPrice = servicesTotal + partsTotal;

    const updatedOrder = await this.prisma.serviceOrder.update({
      where: { id },
      data: { 
        totalPrice,
        status: ServiceOrderStatus.WAITING_APPROVAL 
      },
    });

    return updatedOrder;
  }

  async getAverageExecutionTime() {
    const finishedOrders = await this.prisma.serviceOrder.findMany({
      where: {
        status: { in: [ServiceOrderStatus.FINISHED, ServiceOrderStatus.DELIVERED] },
        startedExecutionAt: { not: null },
        finishedExecutionAt: { not: null },
      },
      select: {
        startedExecutionAt: true,
        finishedExecutionAt: true,
      },
    });

    if (finishedOrders.length === 0) {
      return {
        averageExecutionTimeMinutes: 0,
        totalOrdersAnalyzed: 0,
        message: 'Nenhuma ordem de serviço finalizada ou entregue para calcular a média.',
      };
    }

    let totalDurationMs = 0;
    for (const order of finishedOrders) {
      const start = new Date(order.startedExecutionAt!).getTime();
      const end = new Date(order.finishedExecutionAt!).getTime();
      totalDurationMs += (end - start);
    }

    const averageDurationMinutes = (totalDurationMs / finishedOrders.length) / (1000 * 60);

    return {
      averageExecutionTimeMinutes: parseFloat(averageDurationMinutes.toFixed(2)),
      totalOrdersAnalyzed: finishedOrders.length,
    };
  }
}
