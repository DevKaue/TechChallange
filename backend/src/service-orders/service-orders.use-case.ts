import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { ServiceOrdersRepositoryInterface } from './service-orders-repository.interface';
import { CreateServiceOrderDto } from './dto/service-order/create-service-order.dto';
import { AddEstimateItemDto } from './dto/estimate/add-estimate-item.dto';
import { UpdateEstimateStatusDto } from './dto/estimate/update-estimate-status.dto';
import { RejectEstimateDto } from './dto/estimate/reject-estimate.dto';
import { ServiceOrderStatus, EstimateStatus } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { ServiceOrderResponseDto } from './dto/service-order/service-order-response.dto';
import {
  EstimateResponseDto,
  EstimateItemDto,
} from './dto/estimate/estimate-response.dto';
import { AssignMechanicDto } from './dto/mechanic/assign-mechanic.dto';
import { StartDiagnosisDto } from './dto/diagnosis/start-diagnosis.dto';

@Injectable()
export class ServiceOrdersUseCase {
  constructor(
    private readonly serviceOrdersRepositoryInterface: ServiceOrdersRepositoryInterface,
  ) {}

  async create(createDto: CreateServiceOrderDto) {
    const vehicle = await this.serviceOrdersRepositoryInterface.findVehicleById(
      createDto.vehicleId,
    );

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    if (vehicle.clientId !== createDto.clientId) {
      throw new ConflictException(
        'Vehicle does not belong to the specified client',
      );
    }

    const order = await this.serviceOrdersRepositoryInterface.create({
      clientId: createDto.clientId,
      vehicleId: createDto.vehicleId,
      status: ServiceOrderStatus.RECEIVED,
    });

    await this.serviceOrdersRepositoryInterface.createStatusHistory({
      serviceOrderId: order.id,
      previousStatus: null,
      newStatus: ServiceOrderStatus.RECEIVED,
    });

    return plainToInstance(ServiceOrderResponseDto, order, {
      excludeExtraneousValues: true,
    });
  }

  async findAll() {
    const orders = await this.serviceOrdersRepositoryInterface.findAll();
    return orders.map((item) =>
      plainToInstance(ServiceOrderResponseDto, item, {
        excludeExtraneousValues: true,
      }),
    );
  }

  async findOne(id: string) {
    const serviceOrder =
      await this.serviceOrdersRepositoryInterface.findById(id);

    if (!serviceOrder) {
      throw new NotFoundException(`Service order ${id} not found`);
    }

    return plainToInstance(ServiceOrderResponseDto, serviceOrder, {
      excludeExtraneousValues: true,
    });
  }

  async assignMechanic(id: string, dto: AssignMechanicDto) {
    const current = await this.serviceOrdersRepositoryInterface.findById(id);
    if (!current) {
      throw new NotFoundException(`Service order ${id} not found`);
    }

    this.assertStatus(current.status, ServiceOrderStatus.RECEIVED);

    const user = await this.serviceOrdersRepositoryInterface.findUserById(
      dto.mechanicId,
    );
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.role !== 'MECHANIC') {
      throw new BadRequestException('User is not a mechanic');
    }

    const updated = await this.serviceOrdersRepositoryInterface.assignMechanic(
      id,
      dto.mechanicId,
    );
    return plainToInstance(ServiceOrderResponseDto, updated, {
      excludeExtraneousValues: true,
    });
  }

  async startDiagnosis(id: string, dto: StartDiagnosisDto) {
    const current = await this.serviceOrdersRepositoryInterface.findById(id);
    if (!current) {
      throw new NotFoundException(`Service order ${id} not found`);
    }

    this.assertStatus(
      current.status,
      ServiceOrderStatus.RECEIVED,
      ServiceOrderStatus.IN_DIAGNOSIS,
    );

    const updated = await this.serviceOrdersRepositoryInterface.updateStatus(
      id,
      ServiceOrderStatus.IN_DIAGNOSIS,
    );

    await this.serviceOrdersRepositoryInterface.createStatusHistory({
      serviceOrderId: id,
      previousStatus: current.status,
      newStatus: ServiceOrderStatus.IN_DIAGNOSIS,
      notes: dto.diagnosis,
    });

    return plainToInstance(ServiceOrderResponseDto, updated, {
      excludeExtraneousValues: true,
    });
  }

  async createEstimate(orderId: string) {
    const order = await this.serviceOrdersRepositoryInterface.findById(orderId);

    if (!order) {
      throw new NotFoundException(`Service order ${orderId} not found`);
    }

    this.assertStatus(
      order.status,
      ServiceOrderStatus.RECEIVED,
      ServiceOrderStatus.IN_DIAGNOSIS,
    );

    const [estimate] = await Promise.all([
      this.serviceOrdersRepositoryInterface.createEstimate({
        serviceOrderId: orderId,
        status: EstimateStatus.PENDING,
        totalAmount: 0,
      }),
      this.serviceOrdersRepositoryInterface.updateStatus(
        orderId,
        ServiceOrderStatus.WAITING_APPROVAL,
      ),
    ]);

    await this.serviceOrdersRepositoryInterface.createStatusHistory({
      serviceOrderId: orderId,
      previousStatus: order.status,
      newStatus: ServiceOrderStatus.WAITING_APPROVAL,
      changedBy: 'system',
      notes: 'Estimate generated',
    });

    return plainToInstance(EstimateResponseDto, estimate, {
      excludeExtraneousValues: true,
    });
  }

  async addEstimateItem(estimateId: string, dto: AddEstimateItemDto) {
    let unitPrice = 0;
    let description = '';

    if (dto.itemType === 'SERVICE') {
      const service =
        await this.serviceOrdersRepositoryInterface.findServiceCatalogById(
          dto.referenceId,
        );
      if (!service) {
        throw new NotFoundException('Service not found in catalog');
      }
      unitPrice = service.price;
    } else {
      const part = await this.serviceOrdersRepositoryInterface.findPartById(
        dto.referenceId,
      );
      if (!part) {
        throw new NotFoundException('Part not found');
      }
      if (part.stockQuantity < dto.quantity) {
        throw new ConflictException(
          `Insufficient stock for part ${part.name}. Available: ${part.stockQuantity}`,
        );
      }
      unitPrice = part.price;
      description = part.name;
      await this.serviceOrdersRepositoryInterface.updatePartStock(
        part.id,
        dto.quantity,
      );
    }

    const totalPrice = unitPrice * dto.quantity;

    const item = await this.serviceOrdersRepositoryInterface.addEstimateItem({
      estimateId,
      itemType: dto.itemType,
      referenceId: dto.referenceId,
      description: dto.description ?? description,
      quantity: dto.quantity,
      unitPrice,
      totalPrice,
    });

    return plainToInstance(EstimateItemDto, item, {
      excludeExtraneousValues: true,
    });
  }

  async updateEstimateStatus(estimateId: string, dto: UpdateEstimateStatusDto) {
    if (dto.status === EstimateStatus.APPROVED) {
      const estimate =
        await this.serviceOrdersRepositoryInterface.updateEstimateStatus(
          estimateId,
          dto.status,
          new Date(),
        );

      const order = await this.serviceOrdersRepositoryInterface.findById(
        estimate.serviceOrderId,
      );
      if (!order) {
        throw new NotFoundException('Service order not found');
      }

      await this.serviceOrdersRepositoryInterface.updateStatus(
        order.id,
        ServiceOrderStatus.IN_EXECUTION,
      );
      await this.serviceOrdersRepositoryInterface.createStatusHistory({
        serviceOrderId: order.id,
        previousStatus: order.status,
        newStatus: ServiceOrderStatus.IN_EXECUTION,
      });

      return plainToInstance(EstimateResponseDto, estimate, {
        excludeExtraneousValues: true,
      });
    }

    const estimate =
      await this.serviceOrdersRepositoryInterface.updateEstimateStatus(
        estimateId,
        dto.status,
      );

    return plainToInstance(EstimateResponseDto, estimate, {
      excludeExtraneousValues: true,
    });
  }

  async rejectEstimate(id: string, dto: RejectEstimateDto) {
    const current = await this.serviceOrdersRepositoryInterface.findById(id);
    if (!current) {
      throw new NotFoundException(`Service order ${id} not found`);
    }

    this.assertStatus(current.status, ServiceOrderStatus.WAITING_APPROVAL);

    const updated = await this.serviceOrdersRepositoryInterface.updateStatus(
      id,
      ServiceOrderStatus.DELIVERED,
    );

    await this.serviceOrdersRepositoryInterface.createStatusHistory({
      serviceOrderId: id,
      previousStatus: current.status,
      newStatus: ServiceOrderStatus.DELIVERED,
      notes: dto.reason,
    });

    return plainToInstance(ServiceOrderResponseDto, updated, {
      excludeExtraneousValues: true,
    });
  }

  async startService(id: string) {
    const current = await this.serviceOrdersRepositoryInterface.findById(id);
    if (!current) {
      throw new NotFoundException(`Service order ${id} not found`);
    }

    this.assertStatus(current.status, ServiceOrderStatus.WAITING_APPROVAL);

    const updated = await this.serviceOrdersRepositoryInterface.updateStatus(
      id,
      ServiceOrderStatus.IN_EXECUTION,
    );

    await this.serviceOrdersRepositoryInterface.createStatusHistory({
      serviceOrderId: id,
      previousStatus: current.status,
      newStatus: ServiceOrderStatus.IN_EXECUTION,
    });

    return plainToInstance(ServiceOrderResponseDto, updated, {
      excludeExtraneousValues: true,
    });
  }

  async finish(id: string, mechanicId: string, notes?: string) {
    const serviceOrder = await this.serviceOrdersRepositoryInterface.findById(id);
    if (!serviceOrder) {
      throw new NotFoundException(`Service order ${id} not found`);
    }

    this.assertStatus(serviceOrder.status, ServiceOrderStatus.IN_EXECUTION);

    if (!serviceOrder.mechanicId || serviceOrder.mechanicId !== mechanicId) {
      throw new ForbiddenException(
        'Only the assigned mechanic can finish this service order',
      );
    }

    const updated = await this.serviceOrdersRepositoryInterface.updateStatus(
      id,
      ServiceOrderStatus.FINISHED,
    );

    await this.serviceOrdersRepositoryInterface.createStatusHistory({
      serviceOrderId: id,
      previousStatus: serviceOrder.status,
      newStatus: ServiceOrderStatus.FINISHED,
      ...(notes ? { notes } : {}),
    });

    return plainToInstance(ServiceOrderResponseDto, updated, {
      excludeExtraneousValues: true,
    });
  }

  async updateMechanicAvailability(mechanicId: string, available: boolean) {
    await this.serviceOrdersRepositoryInterface.updateMechanicAvailability(
      mechanicId,
      available,
    );
  }

  async deliverVehicle(id: string) {
    const current = await this.serviceOrdersRepositoryInterface.findById(id);
    if (!current) {
      throw new NotFoundException(`Service order ${id} not found`);
    }

    this.assertStatus(current.status, ServiceOrderStatus.FINISHED);

    const updated = await this.serviceOrdersRepositoryInterface.updateStatus(
      id,
      ServiceOrderStatus.DELIVERED,
    );

    await this.serviceOrdersRepositoryInterface.createStatusHistory({
      serviceOrderId: id,
      previousStatus: current.status,
      newStatus: ServiceOrderStatus.DELIVERED,
    });

    return plainToInstance(ServiceOrderResponseDto, updated, {
      excludeExtraneousValues: true,
    });
  }

  async close(id: string) {
    const current = await this.serviceOrdersRepositoryInterface.findById(id);
    if (!current) {
      throw new NotFoundException(`Service order ${id} not found`);
    }

    this.assertStatus(current.status, ServiceOrderStatus.DELIVERED);

    await this.serviceOrdersRepositoryInterface.setClosedAt(id, new Date());
    const updated = await this.serviceOrdersRepositoryInterface.updateStatus(
      id,
      ServiceOrderStatus.CLOSED,
    );

    await this.serviceOrdersRepositoryInterface.createStatusHistory({
      serviceOrderId: id,
      previousStatus: current.status,
      newStatus: ServiceOrderStatus.CLOSED,
    });

    return plainToInstance(ServiceOrderResponseDto, updated, {
      excludeExtraneousValues: true,
    });
  }

  async getAverageExecutionTime() {
    const finishedOrders =
      await this.serviceOrdersRepositoryInterface.findExecutionTimes();

    if (finishedOrders.length === 0) {
      return {
        averageExecutionTimeMinutes: 0,
        totalOrdersAnalyzed: 0,
        message:
          'No finished or delivered service orders to calculate average.',
      };
    }

    let totalDurationMs = 0;
    for (const order of finishedOrders) {
      totalDurationMs += order.endTime.getTime() - order.startTime.getTime();
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

  private assertStatus(
    current: ServiceOrderStatus,
    ...expected: ServiceOrderStatus[]
  ) {
    if (!expected.includes(current)) {
      throw new BadRequestException(
        `Order status "${current}" does not allow this operation. Expected: ${expected.join(' or ')}`,
      );
    }
  }
}
