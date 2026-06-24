import { Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma/prisma.module';
import { CustomerController } from '@customer-management/presentation/controllers/customer.controller';
import { VehicleController } from '@customer-management/presentation/controllers/vehicle.controller';
import CreateCustomerUseCase from '@customer-management/application/usecases/create-customer.usecase';
import { CreateVehicleUseCase } from '@customer-management/application/usecases/create-vehicle.usecase';
import FindVehicleByIdUseCase from '@customer-management/application/usecases/find-vehicle-by-id.usecase';
import ArchiveVehicleUseCase from '@/customer-management/application/usecases/archive-vehicle.usecase';
import ArchiveCustomerUseCase from '@/customer-management/application/usecases/archive-customer.usecase';
import CustomerManagementFacade from '@customer-management/infra/integrations/customer-management.facade';
import CustomerManagementInterface from '@/common/contracts/customer-management.interface';

import CustomerRepositoryInterface from '@customer-management/domain/contracts/customer-repository.interface';
import VehicleRepositoryInterface from '@customer-management/domain/contracts/vehicle-repository.interface';
import PrismaCustomerRepository from '@customer-management/infra/repositories/prisma-customer.repository';
import PrismaVehicleRepository from '@customer-management/infra/repositories/prisma-vehicle.repository';
import CustomerQueryServiceInterface from '@customer-management/application/contracts/customer-query-service.interface';
import VehicleQueryServiceInterface from '@customer-management/application/contracts/vehicle-query-service.interface';
import FindCustomerByIdUseCase from '@customer-management/application/usecases/find-customer-by-id.usecase';
import PrismaCustomerQueryService from '@customer-management/infra/services/prisma-customer-query.service';
import PrismaVehicleQueryService from '@customer-management/infra/services/prisma-vehicle-query.service';

import UnitOfWorkServiceInterface from '@customer-management/application/contracts/unit-of-work-service.interface';
import PrismaUnitOfWorkService from '@customer-management/infra/services/prisma-unit-of-work.service';

@Module({
  imports: [PrismaModule],
  controllers: [CustomerController, VehicleController],
  providers: [
    PrismaUnitOfWorkService,
    {
      provide: UnitOfWorkServiceInterface,
      useClass: PrismaUnitOfWorkService,
    },
    {
      provide: CustomerRepositoryInterface,
      useClass: PrismaCustomerRepository,    
    },

    {
      provide: CreateCustomerUseCase,
      useFactory: (repository: CustomerRepositoryInterface) => {
        return new CreateCustomerUseCase(repository); 
      },
      inject: [CustomerRepositoryInterface],
    },

    {
      provide: ArchiveCustomerUseCase,
      useFactory: (
        customerRepository: CustomerRepositoryInterface,
        vehicleRepository: VehicleRepositoryInterface,
        unitOfWork: UnitOfWorkServiceInterface,
      ) => {
        return new ArchiveCustomerUseCase(customerRepository, vehicleRepository, unitOfWork);
      },
      inject: [CustomerRepositoryInterface, VehicleRepositoryInterface, UnitOfWorkServiceInterface],
    },

    {
      provide: VehicleRepositoryInterface,
      useClass: PrismaVehicleRepository,
    },

    {
      provide: CreateVehicleUseCase,
      useFactory: (
        vehicleRepository: VehicleRepositoryInterface, 
        customerRepository: CustomerRepositoryInterface
      ) => {
        return new CreateVehicleUseCase(vehicleRepository, customerRepository);
      },
      inject: [VehicleRepositoryInterface, CustomerRepositoryInterface],
    },

    {
      provide: ArchiveVehicleUseCase,
      useFactory: (
        vehicleRepository: VehicleRepositoryInterface
      ) => {
        return new ArchiveVehicleUseCase(vehicleRepository);
      },
      inject: [
        VehicleRepositoryInterface, 
      ]
    },

    {
      provide: CustomerQueryServiceInterface,
      useClass: PrismaCustomerQueryService, 
    },

    {
      provide: FindCustomerByIdUseCase,
      useFactory: (queryService: CustomerQueryServiceInterface) => {
        return new FindCustomerByIdUseCase(queryService); 
      },
      inject: [CustomerQueryServiceInterface],
    },

    {
      provide: VehicleQueryServiceInterface,
      useClass: PrismaVehicleQueryService,
    },

    {
      provide: FindVehicleByIdUseCase,
      useFactory: (queryService: VehicleQueryServiceInterface) => {
        return new FindVehicleByIdUseCase(queryService);
      },
      inject: [VehicleQueryServiceInterface],
    },

    {
      provide: CustomerManagementInterface,
      useFactory: (
        findCustomerByIdUseCase: FindCustomerByIdUseCase,
        findVehicleByIdUseCase: FindVehicleByIdUseCase
      ) => {
        return new CustomerManagementFacade(
          findCustomerByIdUseCase,
          findVehicleByIdUseCase
        );
      },
      inject: [FindCustomerByIdUseCase, FindVehicleByIdUseCase],
    },
  ],
  exports: [CustomerManagementInterface],
})
export class CustomerManagementModule {}
