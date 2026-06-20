import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ServiceOrdersRepositoryInterface } from '@service-orders/domain/contracts/service-orders-repository.interface';
// TODO: Descomente quando customer-management module estiver pronto
// import { CLIENT_REPOSITORY } from '@service-orders/domain/acls/client-repository.interface';
// import type { ClientRepository } from '@service-orders/domain/acls/client-repository.interface';
// import { VEHICLE_REPOSITORY } from '@service-orders/domain/acls/vehicle-repository.interface';
// import type { VehicleRepository } from '@service-orders/domain/acls/vehicle-repository.interface';
import { ServiceOrderStatus } from '@service-orders/domain/enums/service-order-status.enum';
import { ServiceOrderResponseDto } from '@service-orders/application/dto/service-order/service-order-response.dto';
import { CreateServiceOrderDto } from '@service-orders/application/dto/service-order/create-service-order.dto';
import { plainToInstance } from 'class-transformer';
import { ServiceOrderMapper } from '@service-orders/domain/mappers/service-order.mapper';

@Injectable()
export class ServiceOrderUseCase {
  constructor(
    private readonly repository: ServiceOrdersRepositoryInterface,
    // TODO: Descomente quando customer-management module estiver pronto
    // @Inject(CLIENT_REPOSITORY)
    // private readonly clientRepository: ClientRepository,
    // @Inject(VEHICLE_REPOSITORY)
    // private readonly vehicleRepository: VehicleRepository,
  ) {}

  async create(dto: CreateServiceOrderDto) {
    // TODO: Descomente quando customer-management module estiver pronto
    // const vehicle = await this.vehicleRepository.findById(dto.vehicleId);
    // if (!vehicle) {
    //   throw new NotFoundException('Vehicle not found');
    // }
    // if (vehicle.customerId !== dto.customerId) {
    //   throw new BadRequestException(
    //     'Vehicle does not belong to the specified client',
    //   );
    // }

    const order = await this.repository.create({
      customerId: dto.customerId,
      vehicleId: dto.vehicleId,
      status: ServiceOrderStatus.RECEIVED,
    });

    await this.repository.createStatusHistory({
      serviceOrderId: order.id,
      previousStatus: null,
      newStatus: ServiceOrderStatus.RECEIVED,
    });

    return plainToInstance(ServiceOrderResponseDto, order, {
      excludeExtraneousValues: true,
    });
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
    const order = await this.repository.findById(id);
    if (!order) {
      throw new NotFoundException(`Service order ${id} not found`);
    }
    return plainToInstance(ServiceOrderResponseDto, order, {
      excludeExtraneousValues: true,
    });
  }

  async startService(id: string) {
    const data = await this.repository.findById(id);
    if (!data) throw new NotFoundException(`Service order ${id} not found`);

    const order = ServiceOrderMapper.toDomain(data);
    try {
      const change = order.startService();

      const updated = await this.repository.updateStatus(id, change.newStatus);
      await this.repository.createStatusHistory({
        serviceOrderId: id,
        previousStatus: change.previousStatus,
        newStatus: change.newStatus,
      });

      return plainToInstance(ServiceOrderResponseDto, updated, {
        excludeExtraneousValues: true,
      });
    } catch (error: unknown) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Unexpected error',
      );
    }
  }

  async finish(id: string, mechanicId: string, notes?: string) {
    const data = await this.repository.findById(id);
    if (!data) throw new NotFoundException(`Service order ${id} not found`);

    const order = ServiceOrderMapper.toDomain(data);
    try {
      const change = order.finish(mechanicId);

      const updated = await this.repository.updateStatus(id, change.newStatus);
      await this.repository.createStatusHistory({
        serviceOrderId: id,
        previousStatus: change.previousStatus,
        newStatus: change.newStatus,
        ...(notes ? { notes } : {}),
      });

      return plainToInstance(ServiceOrderResponseDto, updated, {
        excludeExtraneousValues: true,
      });
    } catch (error: unknown) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Unexpected error',
      );
    }
  }

  async deliverVehicle(id: string) {
    const data = await this.repository.findById(id);
    if (!data) throw new NotFoundException(`Service order ${id} not found`);

    const order = ServiceOrderMapper.toDomain(data);
    try {
      const change = order.deliverVehicle();

      const updated = await this.repository.updateStatus(id, change.newStatus);
      await this.repository.createStatusHistory({
        serviceOrderId: id,
        previousStatus: change.previousStatus,
        newStatus: change.newStatus,
      });

      return plainToInstance(ServiceOrderResponseDto, updated, {
        excludeExtraneousValues: true,
      });
    } catch (error: unknown) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Unexpected error',
      );
    }
  }

  async close(id: string) {
    const data = await this.repository.findById(id);
    if (!data) throw new NotFoundException(`Service order ${id} not found`);

    const order = ServiceOrderMapper.toDomain(data);
    try {
      const change = order.close();

      await this.repository.setClosedAt(id, new Date());
      const updated = await this.repository.updateStatus(id, change.newStatus);
      await this.repository.createStatusHistory({
        serviceOrderId: id,
        previousStatus: change.previousStatus,
        newStatus: change.newStatus,
      });

      return plainToInstance(ServiceOrderResponseDto, updated, {
        excludeExtraneousValues: true,
      });
    } catch (error: unknown) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Unexpected error',
      );
    }
  }
}
