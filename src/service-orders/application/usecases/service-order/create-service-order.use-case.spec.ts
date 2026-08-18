import { Test, TestingModule } from '@nestjs/testing';
import { CreateServiceOrderUseCase } from './create-service-order.use-case';
import { ServiceOrdersRepositoryInterface } from '@service-orders/domain/contracts/service-orders-repository.interface';
import CustomerManagementInterface from '@/common/contracts/customer-management.interface';
import { ServiceOrderStatus } from '@service-orders/domain/enums/service-order-status.enum';
import { CustomerNotFoundException } from '@service-orders/application/exceptions/customer-not-found.exception';
import { VehicleNotFoundException } from '@service-orders/application/exceptions/vehicle-not-found.exception';
import { VehicleOwnerMismatchException } from '@service-orders/application/exceptions/vehicle-owner-mismatch.exception';
import { CreateEstimateUseCase } from '@service-orders/application/usecases/estimate/create-estimate.use-case';
import { AddEstimateItemUseCase } from '@service-orders/application/usecases/estimate/add-estimate-item.use-case';
import { ServiceOrderItemType } from '@service-orders/domain/enums/service-order-item-type.enum';

describe('CreateServiceOrderUseCase', () => {
  let useCase: CreateServiceOrderUseCase;
  let repository: jest.Mocked<ServiceOrdersRepositoryInterface>;
  let customerManagement: jest.Mocked<CustomerManagementInterface>;
  let createEstimateUseCase: jest.Mocked<CreateEstimateUseCase>;
  let addEstimateItemUseCase: jest.Mocked<AddEstimateItemUseCase>;

  const mockOrder: any = {
    id: 'order-1',
    customerId: 'client-1',
    vehicleId: 'vehicle-1',
    status: ServiceOrderStatus.RECEIVED,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: CreateServiceOrderUseCase,
          useFactory: (
            repository: ServiceOrdersRepositoryInterface,
            customerManagement: CustomerManagementInterface,
            createEstimateUseCase: CreateEstimateUseCase,
            addEstimateItemUseCase: AddEstimateItemUseCase,
          ) =>
            new CreateServiceOrderUseCase(
              repository,
              customerManagement,
              createEstimateUseCase,
              addEstimateItemUseCase,
            ),
          inject: [
            ServiceOrdersRepositoryInterface,
            CustomerManagementInterface,
            CreateEstimateUseCase,
            AddEstimateItemUseCase,
          ],
        },
        {
          provide: ServiceOrdersRepositoryInterface,
          useValue: {
            create: jest.fn(),
            createStatusHistory: jest.fn(),
          },
        },
        {
          provide: CustomerManagementInterface,
          useValue: {
            findCustomerById: jest.fn(),
            findVehicleById: jest.fn(),
          },
        },
        {
          provide: CreateEstimateUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: AddEstimateItemUseCase,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    useCase = module.get(CreateServiceOrderUseCase);
    repository = module.get(ServiceOrdersRepositoryInterface);
    customerManagement = module.get(CustomerManagementInterface);
    createEstimateUseCase = module.get(CreateEstimateUseCase);
    addEstimateItemUseCase = module.get(AddEstimateItemUseCase);
  });

  it('should create a service order when the vehicle belongs to the client', async () => {
    customerManagement.findCustomerById.mockResolvedValue({
      id: 'client-1',
      document: '123',
    } as any);
    customerManagement.findVehicleById.mockResolvedValue({
      id: 'vehicle-1',
      customerId: 'client-1',
    } as any);
    repository.create.mockResolvedValue(mockOrder);
    repository.createStatusHistory.mockResolvedValue({} as any);

    const result = await useCase.execute({
      customerId: 'client-1',
      vehicleId: 'vehicle-1',
    });

    expect(repository.create).toHaveBeenCalledWith({
      customerId: 'client-1',
      vehicleId: 'vehicle-1',
      status: ServiceOrderStatus.RECEIVED,
    });
    expect(result).toHaveProperty('id', 'order-1');
    expect(createEstimateUseCase.execute).not.toHaveBeenCalled();
  });

  it('should create an estimate with service and part items when provided', async () => {
    customerManagement.findCustomerById.mockResolvedValue({
      id: 'client-1',
    } as any);
    customerManagement.findVehicleById.mockResolvedValue({
      id: 'vehicle-1',
      customerId: 'client-1',
    } as any);
    repository.create.mockResolvedValue(mockOrder);
    repository.createStatusHistory.mockResolvedValue({} as any);
    createEstimateUseCase.execute.mockResolvedValue({
      id: 'estimate-1',
    } as any);
    addEstimateItemUseCase.execute.mockResolvedValue({} as any);

    const result = await useCase.execute({
      customerId: 'client-1',
      vehicleId: 'vehicle-1',
      services: [{ referenceId: 'service-1', quantity: 1 }],
      parts: [{ referenceId: 'part-1', quantity: 2 }],
    });

    expect(createEstimateUseCase.execute).toHaveBeenCalledWith('order-1');
    expect(addEstimateItemUseCase.execute).toHaveBeenNthCalledWith(
      1,
      'estimate-1',
      {
        referenceId: 'service-1',
        quantity: 1,
        itemType: ServiceOrderItemType.SERVICE,
      },
    );
    expect(addEstimateItemUseCase.execute).toHaveBeenNthCalledWith(
      2,
      'estimate-1',
      {
        referenceId: 'part-1',
        quantity: 2,
        itemType: ServiceOrderItemType.PART,
      },
    );
    expect(result.status).toBe(ServiceOrderStatus.WAITING_APPROVAL);
  });

  it('should throw when the vehicle does not exist', async () => {
    customerManagement.findCustomerById.mockResolvedValue({
      id: 'client-1',
    } as any);
    customerManagement.findVehicleById.mockResolvedValue(null);

    await expect(
      useCase.execute({ customerId: 'client-1', vehicleId: 'x' }),
    ).rejects.toThrow(VehicleNotFoundException);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('should throw when the customer does not exist', async () => {
    customerManagement.findCustomerById.mockResolvedValue(null);

    await expect(
      useCase.execute({ customerId: 'no-client', vehicleId: 'vehicle-1' }),
    ).rejects.toThrow(CustomerNotFoundException);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('should throw when the vehicle does not belong to the client', async () => {
    customerManagement.findCustomerById.mockResolvedValue({
      id: 'client-1',
    } as any);
    customerManagement.findVehicleById.mockResolvedValue({
      id: 'vehicle-1',
      customerId: 'another-client',
    } as any);

    await expect(
      useCase.execute({ customerId: 'client-1', vehicleId: 'vehicle-1' }),
    ).rejects.toThrow(VehicleOwnerMismatchException);
    expect(repository.create).not.toHaveBeenCalled();
  });
});
