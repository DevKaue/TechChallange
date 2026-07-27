// import { Test, TestingModule } from '@nestjs/testing';
// import { ServiceOrderUseCase } from './service-order.use-case';
// import { ServiceOrdersRepositoryInterface } from '@service-orders/domain/contracts/service-orders-repository.interface';
// import { ServiceOrderQueryServiceInterface } from '@service-orders/application/contracts/service-order-query-service.interface';
// // import { CUSTOMER_REPOSITORY } from '@service-orders/domain/acls/customer-repository.interface';
// // import { VEHICLE_REPOSITORY } from '@service-orders/domain/acls/vehicle-repository.interface';
// import CustomerManagementInterface from '@/common/contracts/customer-management.interface';
// import { BadRequestException } from '@nestjs/common';
// import { ServiceOrderStatus } from '@service-orders/domain/enums/service-order-status.enum';
// import { ServiceOrderNotFoundException } from '@service-orders/application/exceptions/service-order-not-found.exception';
// import { CustomerNotFoundException } from '@service-orders/application/exceptions/customer-not-found.exception';
// import { InvalidStatusTransitionException } from '@service-orders/application/exceptions/invalid-status-transition.exception';
// import { ServiceOrderSummaryDto } from '@service-orders/application/dto/query/service-order-summary.dto';
// import { ServiceOrderDetailDto } from '@service-orders/application/dto/query/service-order-detail.dto';

// describe('ServiceOrderUseCase', () => {
//   let useCase: ServiceOrderUseCase;
//   let repository: jest.Mocked<ServiceOrdersRepositoryInterface>;
//   let queryService: jest.Mocked<ServiceOrderQueryServiceInterface>;
//   let vehicleRepository: { findById: jest.Mock };
//   let customerRepository: { findById: jest.Mock };
//   let customerManagement: jest.Mocked<CustomerManagementInterface>;

//   const mockOrder: any = {
//     id: 'order-1',
//     customerId: 'client-1',
//     vehicleId: 'vehicle-1',
//     status: ServiceOrderStatus.RECEIVED,
//     mileage: null,
//     notes: null,
//     mechanicId: null,
//     closedAt: null,
//     createdAt: new Date(),
//     updatedAt: new Date(),
//     customer: {
//       id: 'client-1',
//       document: '123',
//       email: null,
//       phone: null,
//       createdAt: new Date(),
//       updatedAt: new Date(),
//     },
//     vehicle: {
//       id: 'vehicle-1',
//       plate: 'ABC-123',
//       brand: 'Toyota',
//       model: 'Corolla',
//       year: 2020,
//       customerId: 'client-1',
//       createdAt: new Date(),
//       updatedAt: new Date(),
//     },
//     mechanic: null,
//     estimates: [],
//     statusHistory: [],
//   };

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [
//         ServiceOrderUseCase,
//         {
//           provide: ServiceOrdersRepositoryInterface,
//           useValue: {
//             create: jest.fn(),
//             findById: jest.fn(),
//             update: jest.fn(),
//             createStatusHistory: jest.fn(),
//           },
//         },
//         {
//           provide: ServiceOrderQueryServiceInterface,
//           useValue: {
//             findAll: jest.fn(),
//             findOne: jest.fn(),
//           },
//         },
//         // {
//         //   provide: VEHICLE_REPOSITORY,
//         //   useValue: { findById: jest.fn() },
//         // },
//         // {
//         //   provide: CUSTOMER_REPOSITORY,
//         //   useValue: { findById: jest.fn() },
//         // },
//         {
//           provide: CustomerManagementInterface,
//           useValue: {
//             findCustomerById: jest.fn(),
//             findVehicleById: jest.fn(),
//           },
//         },
//       ],
//     }).compile();

//     useCase = module.get(ServiceOrderUseCase);
//     repository = module.get(ServiceOrdersRepositoryInterface);
//     queryService = module.get(ServiceOrderQueryServiceInterface);
//     // vehicleRepository = module.get(VEHICLE_REPOSITORY);
//     // customerRepository = module.get(CUSTOMER_REPOSITORY);
//     customerManagement = module.get(CustomerManagementInterface);
//   });

//   describe('findAll', () => {
//     it('should return all orders from query service', async () => {
//       const summaries: ServiceOrderSummaryDto[] = [
//         {
//           id: 'order-1',
//           status: ServiceOrderStatus.RECEIVED,
//           mileage: null,
//           notes: null,
//           closedAt: null,
//           createdAt: new Date(),
//           updatedAt: new Date(),
//           customer: { id: 'client-1', name: 'Client' },
//           vehicle: {
//             id: 'vehicle-1',
//             plate: 'ABC-123',
//             brand: 'Toyota',
//             model: 'Corolla',
//             year: 2020,
//           },
//           mechanic: null,
//         },
//       ];
//       queryService.findAll.mockResolvedValue(summaries);

//       const result = await useCase.findAll();
//       expect(result).toHaveLength(1);
//       expect(result[0]).toHaveProperty('id', 'order-1');
//     });
//   });

//   describe('findOne', () => {
//     it('should return the order from query service', async () => {
//       const detail: ServiceOrderDetailDto = {
//         id: 'order-1',
//         status: ServiceOrderStatus.RECEIVED,
//         mileage: null,
//         notes: null,
//         closedAt: null,
//         createdAt: new Date(),
//         updatedAt: new Date(),
//         customer: {
//           id: 'client-1',
//           document: '123',
//           name: 'Client',
//           email: null,
//           phone: null,
//         },
//         vehicle: {
//           id: 'vehicle-1',
//           plate: 'ABC-123',
//           brand: 'Toyota',
//           model: 'Corolla',
//           year: 2020,
//           customerId: 'client-1',
//         },
//         mechanic: null,
//         estimates: [],
//         statusHistory: [],
//       };
//       queryService.findOne.mockResolvedValue(detail);

//       const result = await useCase.findOne('order-1');
//       expect(result).toHaveProperty('id', 'order-1');
//     });

//     it('should throw if not found', async () => {
//       queryService.findOne.mockResolvedValue(null);
//       await expect(useCase.findOne('invalid')).rejects.toThrow(
//         ServiceOrderNotFoundException,
//       );
//     });
//   });

//   describe('create', () => {
//     it('should create a service order when the vehicle belongs to the client', async () => {
//       // customerRepository.findById.mockResolvedValue({ id: 'client-1' });
//       // vehicleRepository.findById.mockResolvedValue({
//       //   id: 'vehicle-1',
//       //   customerId: 'client-1',
//       // });
//       customerManagement.findCustomerById.mockResolvedValue({ id: 'client-1', document: '123', email: null, phone: null, createdAt: new Date(), updatedAt: new Date() } as any);
//       customerManagement.findVehicleById.mockResolvedValue({
//         id: 'vehicle-1',
//         customerId: 'client-1',
//         plate: 'ABC-123',
//         brand: 'Toyota',
//         model: 'Corolla',
//         year: 2020,
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       } as any);
//       repository.create.mockResolvedValue(mockOrder);
//       repository.createStatusHistory.mockResolvedValue({} as any);

//       const result = await useCase.create({
//         customerId: 'client-1',
//         vehicleId: 'vehicle-1',
//       });

//       expect(repository.create).toHaveBeenCalledWith({
//         customerId: 'client-1',
//         vehicleId: 'vehicle-1',
//         status: ServiceOrderStatus.RECEIVED,
//       });
//       expect(result).toHaveProperty('id', 'order-1');
//     });

//     it('should throw when the vehicle does not exist', async () => {
//       // customerRepository.findById.mockResolvedValue({ id: 'client-1' });
//       // vehicleRepository.findById.mockResolvedValue(null);
//       customerManagement.findCustomerById.mockResolvedValue({ id: 'client-1', document: '123', email: null, phone: null, createdAt: new Date(), updatedAt: new Date() } as any);
//       customerManagement.findVehicleById.mockResolvedValue(null);
//       await expect(
//         useCase.create({ customerId: 'client-1', vehicleId: 'x' }),
//       ).rejects.toThrow(BadRequestException);
//       expect(repository.create).not.toHaveBeenCalled();
//     });

//     it('should throw when the customer does not exist', async () => {
//       // customerRepository.findById.mockResolvedValue(null);
//       customerManagement.findCustomerById.mockResolvedValue(null);
//       await expect(
//         useCase.create({ customerId: 'no-client', vehicleId: 'vehicle-1' }),
//       ).rejects.toThrow(CustomerNotFoundException);
//       expect(repository.create).not.toHaveBeenCalled();
//     });

//     it('should throw when the vehicle does not belong to the client', async () => {
//       // customerRepository.findById.mockResolvedValue({ id: 'client-1' });
//       // vehicleRepository.findById.mockResolvedValue({
//       //   id: 'vehicle-1',
//       //   customerId: 'another-client',
//       // });
//       customerManagement.findCustomerById.mockResolvedValue({ id: 'client-1', document: '123', email: null, phone: null, createdAt: new Date(), updatedAt: new Date() } as any);
//       customerManagement.findVehicleById.mockResolvedValue({
//         id: 'vehicle-1',
//         customerId: 'another-client',
//         plate: 'ABC-123',
//         brand: 'Toyota',
//         model: 'Corolla',
//         year: 2020,
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       } as any);
//       await expect(
//         useCase.create({ customerId: 'client-1', vehicleId: 'vehicle-1' }),
//       ).rejects.toThrow(BadRequestException);
//       expect(repository.create).not.toHaveBeenCalled();
//     });
//   });

//   describe('startService', () => {
//     it('should move from WAITING_APPROVAL to IN_EXECUTION', async () => {
//       const waitingApproval = {
//         ...mockOrder,
//         status: ServiceOrderStatus.WAITING_APPROVAL,
//       };
//       repository.findById.mockResolvedValue(waitingApproval);
//       repository.update.mockResolvedValue({
//         ...waitingApproval,
//         status: ServiceOrderStatus.IN_EXECUTION,
//       });
//       repository.createStatusHistory.mockResolvedValue({} as any);

//       const result = await useCase.startService('order-1');

//       expect(repository.update).toHaveBeenCalledWith(
//         'order-1',
//         expect.objectContaining({ status: ServiceOrderStatus.IN_EXECUTION }),
//       );
//       expect(result).toBeDefined();
//     });

//     it('should throw if status is not WAITING_APPROVAL', async () => {
//       repository.findById.mockResolvedValue(mockOrder);
//       await expect(useCase.startService('order-1')).rejects.toThrow(
//         InvalidStatusTransitionException,
//       );
//     });

//     it('should throw if order not found', async () => {
//       repository.findById.mockResolvedValue(null);
//       await expect(useCase.startService('invalid')).rejects.toThrow(
//         ServiceOrderNotFoundException,
//       );
//     });
//   });

//   describe('finish', () => {
//     it('should move from IN_EXECUTION to FINISHED', async () => {
//       const inExecution = {
//         ...mockOrder,
//         status: ServiceOrderStatus.IN_EXECUTION,
//         mechanicId: 'user-1',
//       };
//       repository.findById.mockResolvedValue(inExecution);
//       repository.update.mockResolvedValue({
//         ...inExecution,
//         status: ServiceOrderStatus.FINISHED,
//       });
//       repository.createStatusHistory.mockResolvedValue({} as any);

//       await useCase.finish('order-1', 'user-1');

//       expect(repository.update).toHaveBeenCalledWith(
//         'order-1',
//         expect.objectContaining({ status: ServiceOrderStatus.FINISHED }),
//       );
//     });

//     it('should pass notes to status history', async () => {
//       const inExecution = {
//         ...mockOrder,
//         status: ServiceOrderStatus.IN_EXECUTION,
//         mechanicId: 'user-1',
//       };
//       repository.findById.mockResolvedValue(inExecution);
//       repository.update.mockResolvedValue({
//         ...inExecution,
//         status: ServiceOrderStatus.FINISHED,
//       });
//       repository.createStatusHistory.mockResolvedValue({} as any);

//       await useCase.finish('order-1', 'user-1', 'Completed all repairs');

//       expect(repository.createStatusHistory).toHaveBeenCalledWith(
//         expect.objectContaining({ notes: 'Completed all repairs' }),
//       );
//     });

//     it('should throw if not the assigned mechanic', async () => {
//       const inExecution = {
//         ...mockOrder,
//         status: ServiceOrderStatus.IN_EXECUTION,
//         mechanicId: 'mechanic-A',
//       };
//       repository.findById.mockResolvedValue(inExecution);
//       await expect(useCase.finish('order-1', 'mechanic-B')).rejects.toThrow(
//         InvalidStatusTransitionException,
//       );
//     });

//     it('should throw if no mechanic assigned', async () => {
//       const inExecution = {
//         ...mockOrder,
//         status: ServiceOrderStatus.IN_EXECUTION,
//         mechanicId: null,
//       };
//       repository.findById.mockResolvedValue(inExecution);
//       await expect(useCase.finish('order-1', 'user-1')).rejects.toThrow(
//         InvalidStatusTransitionException,
//       );
//     });

//     it('should throw if order not found', async () => {
//       repository.findById.mockResolvedValue(null);
//       await expect(useCase.finish('invalid', 'user-1')).rejects.toThrow(
//         ServiceOrderNotFoundException,
//       );
//     });
//   });

//   describe('deliverVehicle', () => {
//     it('should move from FINISHED to DELIVERED', async () => {
//       const finished = { ...mockOrder, status: ServiceOrderStatus.FINISHED };
//       repository.findById.mockResolvedValue(finished);
//       repository.update.mockResolvedValue({
//         ...finished,
//         status: ServiceOrderStatus.DELIVERED,
//       });
//       repository.createStatusHistory.mockResolvedValue({} as any);

//       await useCase.deliverVehicle('order-1');
//       expect(repository.update).toHaveBeenCalledWith(
//         'order-1',
//         expect.objectContaining({ status: ServiceOrderStatus.DELIVERED }),
//       );
//     });

//     it('should throw if order not found', async () => {
//       repository.findById.mockResolvedValue(null);
//       await expect(useCase.deliverVehicle('invalid')).rejects.toThrow(
//         ServiceOrderNotFoundException,
//       );
//     });
//   });

//   describe('close', () => {
//     it('should move from DELIVERED to CLOSED', async () => {
//       const delivered = { ...mockOrder, status: ServiceOrderStatus.DELIVERED };
//       repository.findById.mockResolvedValue(delivered);
//       repository.update.mockResolvedValue({
//         ...delivered,
//         status: ServiceOrderStatus.CLOSED,
//       });
//       repository.createStatusHistory.mockResolvedValue({} as any);

//       await useCase.close('order-1');

//       expect(repository.update).toHaveBeenCalledWith(
//         'order-1',
//         expect.objectContaining({
//           status: ServiceOrderStatus.CLOSED,
//           closedAt: expect.any(Date),
//         }),
//       );
//     });

//     it('should throw if order not found', async () => {
//       repository.findById.mockResolvedValue(null);
//       await expect(useCase.close('invalid')).rejects.toThrow(
//         ServiceOrderNotFoundException,
//       );
//     });
//   });
// });
