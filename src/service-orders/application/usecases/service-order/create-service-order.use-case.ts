import { ServiceOrdersRepositoryInterface } from '@service-orders/domain/contracts/service-orders-repository.interface';
import CustomarManagementInterface from '@common/application/contracts/customer-management.interface';
import { ServiceOrderStatus } from '@service-orders/domain/enums/service-order-status.enum';
import { ServiceOrderItemType } from '@service-orders/domain/enums/service-order-item-type.enum';
import { ServiceOrderResponseDto } from '@service-orders/application/dto/service-order/service-order-response.dto';
import { CreateServiceOrderDto } from '@service-orders/application/dto/service-order/create-service-order.dto';
import { CreateEstimateUseCase } from '@service-orders/application/usecases/estimate/create-estimate.use-case';
import { AddEstimateItemUseCase } from '@service-orders/application/usecases/estimate/add-estimate-item.use-case';
import { plainToInstance } from 'class-transformer';
import { CustomerNotFoundException } from '@service-orders/application/exceptions/customer-not-found.exception';
import { VehicleNotFoundException } from '@service-orders/application/exceptions/vehicle-not-found.exception';
import { VehicleOwnerMismatchException } from '@service-orders/application/exceptions/vehicle-owner-mismatch.exception';
import { ServiceOrderNotFoundException } from '@service-orders/application/exceptions/service-order-not-found.exception';

export class CreateServiceOrderUseCase {
  constructor(
    private readonly repository: ServiceOrdersRepositoryInterface,
    private readonly customerManagement: CustomarManagementInterface,
    private readonly createEstimateUseCase: CreateEstimateUseCase,
    private readonly addEstimateItemUseCase: AddEstimateItemUseCase,
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
      throw new VehicleNotFoundException(dto.vehicleId);
    }
    if (vehicle.customerId !== dto.customerId) {
      throw new VehicleOwnerMismatchException(vehicle.id, dto.customerId);
    }

    const order = await this.repository.create({
      customerId: dto.customerId,
      vehicleId: dto.vehicleId,
      status: ServiceOrderStatus.RECEIVED,
      mileage: dto.mileage ?? null,
      notes: dto.notes ?? null,
    });

    await this.repository.createStatusHistory({
      serviceOrderId: order.id,
      previousStatus: null,
      newStatus: ServiceOrderStatus.RECEIVED,
    });

    const hasItems =
      (dto.services?.length ?? 0) > 0 || (dto.parts?.length ?? 0) > 0;

    if (hasItems) {
      const estimate = await this.createEstimateUseCase.execute(order.id);

      for (const service of dto.services ?? []) {
        await this.addEstimateItemUseCase.execute(estimate.id, {
          itemType: ServiceOrderItemType.SERVICE,
          referenceId: service.referenceId,
          quantity: service.quantity,
          description: service.description,
        });
      }

      for (const part of dto.parts ?? []) {
        await this.addEstimateItemUseCase.execute(estimate.id, {
          itemType: ServiceOrderItemType.PART,
          referenceId: part.referenceId,
          quantity: part.quantity,
          description: part.description,
        });
      }
    }

    const persisted = await this.repository.findById(order.id);
    if (!persisted) throw new ServiceOrderNotFoundException(order.id);

    return plainToInstance(
      ServiceOrderResponseDto,
      {
        ...persisted,
        client: persisted.customer
          ? { id: persisted.customer.id, name: persisted.customer.name }
          : undefined,
      },
      {
        excludeExtraneousValues: true,
      },
    );
  }
}
