import { ServiceOrdersRepositoryInterface } from '@service-orders/domain/contracts/service-orders-repository.interface';
import CustomarManagementInterface from '@common/contracts/customer-management.interface';
import { ServiceOrderStatus } from '@service-orders/domain/enums/service-order-status.enum';
import { ServiceOrderResponseDto } from '@service-orders/application/dto/service-order/service-order-response.dto';
import { CreateServiceOrderDto } from '@service-orders/application/dto/service-order/create-service-order.dto';
import { plainToInstance } from 'class-transformer';
import { CustomerNotFoundException } from '@service-orders/application/exceptions/customer-not-found.exception';
import { VehicleNotFoundException } from '@service-orders/application/exceptions/vehicle-not-found.exception';
import { VehicleOwnerMismatchException } from '@service-orders/application/exceptions/vehicle-owner-mismatch.exception';
import { CreateEstimateUseCase } from '@service-orders/application/usecases/estimate/create-estimate.use-case';
import { AddEstimateItemUseCase } from '@service-orders/application/usecases/estimate/add-estimate-item.use-case';
import { ServiceOrderItemType } from '@service-orders/domain/enums/service-order-item-type.enum';

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
    });

    await this.repository.createStatusHistory({
      serviceOrderId: order.id,
      previousStatus: null,
      newStatus: ServiceOrderStatus.RECEIVED,
    });

    const hasEstimateItems = Boolean(dto.services?.length || dto.parts?.length);
    if (hasEstimateItems) {
      await this.createEstimateWithItems(order.id, dto);
    }

    return plainToInstance(
      ServiceOrderResponseDto,
      {
        ...order,
        status: hasEstimateItems
          ? ServiceOrderStatus.WAITING_APPROVAL
          : order.status,
      },
      {
        excludeExtraneousValues: true,
      },
    );
  }

  private async createEstimateWithItems(
    orderId: string,
    dto: CreateServiceOrderDto,
  ): Promise<void> {
    const estimate = await this.createEstimateUseCase.execute(orderId);
    const items = [
      ...(dto.services ?? []).map((service) => ({
        ...service,
        itemType: ServiceOrderItemType.SERVICE,
      })),
      ...(dto.parts ?? []).map((part) => ({
        ...part,
        itemType: ServiceOrderItemType.PART,
      })),
    ];

    for (const item of items) {
      await this.addEstimateItemUseCase.execute(estimate.id, item);
    }
  }
}
