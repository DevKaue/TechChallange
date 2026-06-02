import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { ServiceOrdersRepositoryInterface } from './service-orders-repository.interface';
import { CreateServiceOrderDto } from './dto/create-service-order.dto';
import { UpdateServiceOrderStatusDto } from './dto/update-service-order-status.dto';
import { AddItemToOrderDto } from './dto/add-item-to-order.dto';
import { ServiceOrderStatus } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import {
  ServiceOrderResponseDto,
  ServiceItemDto,
  PartItemDto,
} from './dto/service-order-response.dto';

@Injectable()
export class ServiceOrdersUseCase {
  constructor(
    private readonly repository: ServiceOrdersRepositoryInterface,
  ) {}

  async create(createDto: CreateServiceOrderDto) {
    const vehicle = await this.repository.findVehicleById(createDto.vehicleId);

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    if (vehicle.clientId !== createDto.clientId) {
      throw new ConflictException(
        'Vehicle does not belong to the specified client',
      );
    }

    return plainToInstance(
      ServiceOrderResponseDto,
      await this.repository.create({
        clientId: createDto.clientId,
        vehicleId: createDto.vehicleId,
        status: ServiceOrderStatus.RECEIVED,
      }),
      { excludeExtraneousValues: true },
    );
  }

  async findAll() {
    const orders = await this.repository.findAll();
    return orders.map((item) =>
      plainToInstance(ServiceOrderResponseDto, item, {
        excludeExtraneousValues: true,
      }),
    );
  }

  async findOne(id: string) {
    const serviceOrder = await this.repository.findById(id);

    if (!serviceOrder) {
      throw new NotFoundException(`Service Order ${id} not found`);
    }

    return plainToInstance(ServiceOrderResponseDto, serviceOrder, {
      excludeExtraneousValues: true,
    });
  }

  async updateStatus(id: string, updateDto: UpdateServiceOrderStatusDto) {
    const serviceOrder = await this.findOne(id);

    const data: {
      status: ServiceOrderStatus;
      startedExecutionAt?: Date;
      finishedExecutionAt?: Date;
    } = { status: updateDto.status };

    if (
      updateDto.status === ServiceOrderStatus.IN_PROGRESS &&
      !serviceOrder.startedExecutionAt
    ) {
      data.startedExecutionAt = new Date();
    } else if (
      updateDto.status === ServiceOrderStatus.FINISHED &&
      !serviceOrder.finishedExecutionAt
    ) {
      data.finishedExecutionAt = new Date();
    }

    return plainToInstance(
      ServiceOrderResponseDto,
      await this.repository.updateStatus(id, data),
      { excludeExtraneousValues: true },
    );
  }

  async addService(orderId: string, addDto: AddItemToOrderDto) {
    const serviceOrder = await this.findOne(orderId);

    if (
      serviceOrder.status !== ServiceOrderStatus.RECEIVED &&
      serviceOrder.status !== ServiceOrderStatus.IN_DIAGNOSTICS
    ) {
      throw new BadRequestException(
        'Cannot add services to an order that is already approved or further.',
      );
    }

    const catalogService =
      await this.repository.findServiceCatalogById(addDto.itemId);

    if (!catalogService) {
      throw new NotFoundException('Service not found in catalog');
    }

    return plainToInstance(
      ServiceItemDto,
      await this.repository.createServiceItem({
        serviceOrderId: orderId,
        serviceCatalogId: catalogService.id,
        quantity: addDto.quantity,
        priceAtTime: catalogService.price,
      }),
      { excludeExtraneousValues: true },
    );
  }

  async addPart(orderId: string, addDto: AddItemToOrderDto) {
    const serviceOrder = await this.findOne(orderId);

    if (
      serviceOrder.status !== ServiceOrderStatus.RECEIVED &&
      serviceOrder.status !== ServiceOrderStatus.IN_DIAGNOSTICS
    ) {
      throw new BadRequestException(
        'Cannot add parts to an order that is already approved or further.',
      );
    }

    const part = await this.repository.findPartById(addDto.itemId);

    if (!part) {
      throw new NotFoundException('Part not found');
    }

    if (part.stockQuantity < addDto.quantity) {
      throw new ConflictException(
        `Insufficient stock for part ${part.name}. Available: ${part.stockQuantity}`,
      );
    }

    await this.repository.updatePartStock(part.id, addDto.quantity);

    return plainToInstance(
      PartItemDto,
      await this.repository.createPartItem({
        serviceOrderId: orderId,
        partId: part.id,
        quantity: addDto.quantity,
        priceAtTime: part.price,
      }),
      { excludeExtraneousValues: true },
    );
  }

  async generateBudget(id: string) {
    const order = await this.findOne(id);

    const servicesTotal = (order.services ?? []).reduce(
      (acc, item) => acc + item.priceAtTime * item.quantity,
      0,
    );
    const partsTotal = (order.parts ?? []).reduce(
      (acc, item) => acc + item.priceAtTime * item.quantity,
      0,
    );

    const totalPrice = servicesTotal + partsTotal;

    return plainToInstance(
      ServiceOrderResponseDto,
      await this.repository.updateTotalPrice(
        id,
        totalPrice,
        ServiceOrderStatus.WAITING_APPROVAL,
      ),
      { excludeExtraneousValues: true },
    );
  }

  async getAverageExecutionTime() {
    const finishedOrders = await this.repository.findFinishedOrders();

    if (finishedOrders.length === 0) {
      return {
        averageExecutionTimeMinutes: 0,
        totalOrdersAnalyzed: 0,
        message:
          'Nenhuma ordem de serviço finalizada ou entregue para calcular a média.',
      };
    }

    let totalDurationMs = 0;
    for (const order of finishedOrders) {
      const start = new Date(order.startedExecutionAt!).getTime();
      const end = new Date(order.finishedExecutionAt!).getTime();
      totalDurationMs += end - start;
    }

    const averageDurationMinutes =
      totalDurationMs / finishedOrders.length / (1000 * 60);

    return {
      averageExecutionTimeMinutes: parseFloat(
        averageDurationMinutes.toFixed(2),
      ),
      totalOrdersAnalyzed: finishedOrders.length,
    };
  }
}
