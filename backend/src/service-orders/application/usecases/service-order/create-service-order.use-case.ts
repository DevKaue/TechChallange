import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ServiceOrdersRepositoryInterface } from '@service-orders/domain/contracts/service-orders-repository.interface';
import CustomarManagementInterface from '@common/contracts/customer-management.interface';
import { ServiceOrderStatus } from '@service-orders/domain/enums/service-order-status.enum';
import { ServiceOrderResponseDto } from '@service-orders/application/dto/service-order/service-order-response.dto';
import { CreateServiceOrderDto } from '@service-orders/application/dto/service-order/create-service-order.dto';
import { plainToInstance } from 'class-transformer';
import { CustomerNotFoundException } from '@service-orders/application/exceptions/customer-not-found.exception';

@Injectable()
export class CreateServiceOrderUseCase {
  constructor(
    private readonly repository: ServiceOrdersRepositoryInterface,
    @Inject(CustomarManagementInterface)
    private readonly customerManagement: CustomarManagementInterface,
  ) {}

  async execute(dto: CreateServiceOrderDto) {
    const customer = await this.customerManagement.findCustomerById({
      id: dto.customerId,
    });
    if (!customer) throw new CustomerNotFoundException(dto.customerId);

    const vehicle = await this.customerManagement.findVehicleById({
      id: dto.vehicleId,
    });
    if (!vehicle) {
      throw new BadRequestException('Vehicle not found');
    }
    if (vehicle.customerId !== dto.customerId) {
      throw new BadRequestException(
        'Vehicle does not belong to the specified client',
      );
    }

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
}