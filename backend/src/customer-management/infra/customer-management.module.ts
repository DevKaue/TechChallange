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
import { CLIENT_REPOSITORY } from '@service-orders/domain/acls/client-repository.interface';
import { VEHICLE_REPOSITORY } from '@service-orders/domain/acls/vehicle-repository.interface';

import CustomerRepositoryInterface from '@customer-management/domain/contracts/customer-repository.interface';
import VehicleRepositoryInterface from '@customer-management/domain/contracts/vehicle-repository.interface';
import PrismaCustomerRepository from '@customer-management/infra/repositories/prisma-customer.repository';
import PrismaVehicleRepository from '@customer-management/infra/repositories/prisma-vehicle.repository';
import CustomerQueryServiceInterface from '@customer-management/application/contracts/customer-query-service.interface';
import VehicleQueryServiceInterface from '@customer-management/application/contracts/vehicle-query-service.interface';
import FindCustomerByIdUseCase from '@customer-management/application/usecases/find-customer-by-id.usecase';
import ListCustomersUseCase from '@customer-management/application/usecases/list-customers.usecase';
import UpdateCustomerUseCase from '@customer-management/application/usecases/update-customer.usecase';
import ListVehiclesUseCase from '@customer-management/application/usecases/list-vehicles.usecase';
import UpdateVehicleUseCase from '@customer-management/application/usecases/update-vehicle.usecase';
import PrismaCustomerQueryService from '@customer-management/infra/services/prisma-customer-query.service';
import PrismaVehicleQueryService from '@customer-management/infra/services/prisma-vehicle-query.service';

import UnitOfWorkServiceInterface from '@customer-management/application/contracts/unit-of-work-service.interface';
import PrismaUnitOfWorkService from '@customer-management/infra/services/prisma-unit-of-work.service';
import CustomerRegistrationChecker from '../domain/services/customer-registration-checker.service';
import VehicleRegistrationChecker from '../domain/services/vehicle-registration-checker.service';

@Module({
  imports: [PrismaModule],
  controllers: [CustomerController, VehicleController],
  providers: [
    PrismaUnitOfWorkService,
    CustomerRegistrationChecker,
    VehicleRegistrationChecker,
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
      useFactory: (repository: CustomerRepositoryInterface, registrationChecker: CustomerRegistrationChecker) => {
        return new CreateCustomerUseCase(repository, registrationChecker); 
      },
      inject: [CustomerRepositoryInterface, CustomerRegistrationChecker],
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
        customerRepository: CustomerRepositoryInterface,
        registrationChecker: VehicleRegistrationChecker
      ) => {
        return new CreateVehicleUseCase(vehicleRepository, customerRepository, registrationChecker);
      },
      inject: [VehicleRepositoryInterface, CustomerRepositoryInterface, VehicleRegistrationChecker],
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
      provide: ListCustomersUseCase,
      useFactory: (queryService: CustomerQueryServiceInterface) => {
        return new ListCustomersUseCase(queryService);
      },
      inject: [CustomerQueryServiceInterface],
    },

    {
      provide: UpdateCustomerUseCase,
      useFactory: (repository: CustomerRepositoryInterface) => {
        return new UpdateCustomerUseCase(repository);
      },
      inject: [CustomerRepositoryInterface],
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
      provide: ListVehiclesUseCase,
      useFactory: (queryService: VehicleQueryServiceInterface) => {
        return new ListVehiclesUseCase(queryService);
      },
      inject: [VehicleQueryServiceInterface],
    },

    {
      provide: UpdateVehicleUseCase,
      useFactory: (vehicleRepository: VehicleRepositoryInterface) => {
        return new UpdateVehicleUseCase(vehicleRepository);
      },
      inject: [VehicleRepositoryInterface],
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

    // ACL adapters expostos para outros bounded contexts (service-orders).
    {
      provide: CLIENT_REPOSITORY,
      useFactory: (repository: CustomerRepositoryInterface) => ({
        findById: async (id: string) => {
          const customer = await repository.findById(id);
          return customer
            ? {
                id: customer.id,
                document: customer.document.value,
                name: customer.name,
                email: customer.email?.value ?? null,
                phone: customer.phone ?? null,
              }
            : null;
        },
      }),
      inject: [CustomerRepositoryInterface],
    },

    {
      provide: VEHICLE_REPOSITORY,
      useFactory: (repository: VehicleRepositoryInterface) => ({
        findById: async (id: string) => {
          const vehicle = await repository.findById(id);
          return vehicle
            ? {
                id: vehicle.id,
                plate: vehicle.licensePlate.value,
                brand: vehicle.brand,
                model: vehicle.model,
                year: vehicle.year.value,
                customerId: vehicle.customerId,
              }
            : null;
        },
      }),
      inject: [VehicleRepositoryInterface],
    },
  ],
  exports: [CustomerManagementInterface, CLIENT_REPOSITORY, VEHICLE_REPOSITORY],
})
export class CustomerManagementModule {}
