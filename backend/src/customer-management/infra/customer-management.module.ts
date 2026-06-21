import { Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma/prisma.module';
import { CustomerController } from '@customer-management/presentation/controllers/customer.controller';
import { VehicleController } from '@customer-management/presentation/controllers/vehicle.controller';
import CreateCustomerUseCase from '@customer-management/application/usecases/create-customer.usecase';
import { CreateVehicleUseCase } from '@customer-management/application/usecases/create-vehicle.usecase';
import FindVehicleByIdUseCase from '@customer-management/application/usecases/find-vehicle-by-id.usecase';
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

@Module({
  imports: [PrismaModule],
  controllers: [CustomerController, VehicleController],
  providers: [
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
      provide: VehicleRepositoryInterface,
      useClass: PrismaVehicleRepository,
    },

    {
      provide: CreateVehicleUseCase,
      useFactory: (repository: VehicleRepositoryInterface) => {
        return new CreateVehicleUseCase(repository);
      },
      inject: [VehicleRepositoryInterface],
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
