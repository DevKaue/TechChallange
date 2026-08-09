import { Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma/prisma.module';
import { CustomerInfraController } from '@/customer-management/infra/controllers/customer.controller';
import { VehicleInfraController } from '@/customer-management/infra/controllers/vehicle.controller';
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
import ListCustomerUseCase from '@/customer-management/application/usecases/list-customer.usecase';
import UpdateCustomerUseCase from '@customer-management/application/usecases/update-customer.usecase';
import ListVehicleUseCase from '@/customer-management/application/usecases/list-vehicle.usecase';
import UpdateVehicleUseCase from '@customer-management/application/usecases/update-vehicle.usecase';
import PrismaCustomerQueryService from '@customer-management/infra/services/prisma-customer-query.service';
import PrismaVehicleQueryService from '@customer-management/infra/services/prisma-vehicle-query.service';

import UnitOfWorkServiceInterface from '@customer-management/application/contracts/unit-of-work-service.interface';
import PrismaUnitOfWorkService from '@customer-management/infra/services/prisma-unit-of-work.service';
import CustomerRegistrationChecker from '../domain/services/customer-registration-checker.service';
import VehicleRegistrationChecker from '../domain/services/vehicle-registration-checker.service';
import CreateCustomerController from '@/customer-management/presentation/controllers/create-customer.controller';
import FindCustomerByIdController from '@/customer-management/presentation/controllers/find-customer-by-id.controller';
import ListCustomersController from '@/customer-management/presentation/controllers/list-customers.controller';
import UpdateCustomerController from '@/customer-management/presentation/controllers/update-customer.controller';
import ArchiveCustomerController from '@/customer-management/presentation/controllers/archive-customer.controller';
import CreateVehicleController from '@/customer-management/presentation/controllers/create-vehicle.controller';
import FindVehicleByIdController from '@/customer-management/presentation/controllers/find-vehicle-by-id.controller';
import ListVehiclesController from '@/customer-management/presentation/controllers/list-vehicles.controller';
import UpdateVehicleController from '@/customer-management/presentation/controllers/update-vehicle.controller';
import ArchiveVehicleController from '@/customer-management/presentation/controllers/archive-vehicle.controller';

@Module({
  imports: [PrismaModule],
  controllers: [CustomerInfraController, VehicleInfraController],
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
      useFactory: (
        repository: CustomerRepositoryInterface,
        registrationChecker: CustomerRegistrationChecker,
      ) => {
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
        return new ArchiveCustomerUseCase(
          customerRepository,
          vehicleRepository,
          unitOfWork,
        );
      },
      inject: [
        CustomerRepositoryInterface,
        VehicleRepositoryInterface,
        UnitOfWorkServiceInterface,
      ],
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
        registrationChecker: VehicleRegistrationChecker,
      ) => {
        return new CreateVehicleUseCase(
          vehicleRepository,
          customerRepository,
          registrationChecker,
        );
      },
      inject: [
        VehicleRepositoryInterface,
        CustomerRepositoryInterface,
        VehicleRegistrationChecker,
      ],
    },

    {
      provide: ArchiveVehicleUseCase,
      useFactory: (vehicleRepository: VehicleRepositoryInterface) => {
        return new ArchiveVehicleUseCase(vehicleRepository);
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
      provide: ListCustomerUseCase,
      useFactory: (queryService: CustomerQueryServiceInterface) => {
        return new ListCustomerUseCase(queryService);
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
      provide: ListVehicleUseCase,
      useFactory: (queryService: VehicleQueryServiceInterface) => {
        return new ListVehicleUseCase(queryService);
      },
      inject: [VehicleQueryServiceInterface],
    },

    {
      provide: UpdateVehicleUseCase,
      useFactory: (
        vehicleRepository: VehicleRepositoryInterface,
        registrationChecker: VehicleRegistrationChecker,
      ) => {
        return new UpdateVehicleUseCase(vehicleRepository, registrationChecker);
      },
      inject: [VehicleRepositoryInterface, VehicleRegistrationChecker],
    },

    {
      provide: VehicleRegistrationChecker,
      useFactory: (vehicleRepository: VehicleRepositoryInterface) => {
        return new VehicleRegistrationChecker(vehicleRepository);
      },
      inject: [VehicleRepositoryInterface],
    },

    {
      provide: CustomerRegistrationChecker,
      useFactory: (customerRepository: CustomerRepositoryInterface) => {
        return new CustomerRegistrationChecker(customerRepository);
      },
      inject: [CustomerRepositoryInterface],
    },

    {
      provide: CustomerManagementInterface,
      useFactory: (
        findCustomerByIdUseCase: FindCustomerByIdUseCase,
        findVehicleByIdUseCase: FindVehicleByIdUseCase,
      ) => {
        return new CustomerManagementFacade(
          findCustomerByIdUseCase,
          findVehicleByIdUseCase,
        );
      },
      inject: [FindCustomerByIdUseCase, FindVehicleByIdUseCase],
    },

    {
      provide: CreateCustomerController,
      useFactory: (createCustomerUseCase: CreateCustomerUseCase) => {
        return new CreateCustomerController(createCustomerUseCase);
      },
      inject: [CreateCustomerUseCase],
    },
    {
      provide: FindCustomerByIdController,
      useFactory: (findCustomerByIdUseCase: FindCustomerByIdUseCase) => {
        return new FindCustomerByIdController(findCustomerByIdUseCase);
      },
      inject: [FindCustomerByIdUseCase],
    },
    {
      provide: ListCustomersController,
      useFactory: (listCustomerUseCase: ListCustomerUseCase) => {
        return new ListCustomersController(listCustomerUseCase);
      },
      inject: [ListCustomerUseCase],
    },
    {
      provide: UpdateCustomerController,
      useFactory: (updateCustomerUseCase: UpdateCustomerUseCase) => {
        return new UpdateCustomerController(updateCustomerUseCase);
      },
      inject: [UpdateCustomerUseCase],
    },
    {
      provide: ArchiveCustomerController,
      useFactory: (archiveCustomerUseCase: ArchiveCustomerUseCase) => {
        return new ArchiveCustomerController(archiveCustomerUseCase);
      },
      inject: [ArchiveCustomerUseCase],
    },

    {
      provide: CreateVehicleController,
      useFactory: (createVehicleUseCase: CreateVehicleUseCase) => {
        return new CreateVehicleController(createVehicleUseCase);
      },
      inject: [CreateVehicleUseCase],
    },
    {
      provide: FindVehicleByIdController,
      useFactory: (findVehicleByIdUseCase: FindVehicleByIdUseCase) => {
        return new FindVehicleByIdController(findVehicleByIdUseCase);
      },
      inject: [FindVehicleByIdUseCase],
    },
    {
      provide: ListVehiclesController,
      useFactory: (listVehicleUseCase: ListVehicleUseCase) => {
        return new ListVehiclesController(listVehicleUseCase);
      },
      inject: [ListVehicleUseCase],
    },
    {
      provide: UpdateVehicleController,
      useFactory: (updateVehicleUseCase: UpdateVehicleUseCase) => {
        return new UpdateVehicleController(updateVehicleUseCase);
      },
      inject: [UpdateVehicleUseCase],
    },
    {
      provide: ArchiveVehicleController,
      useFactory: (archiveVehicleUseCase: ArchiveVehicleUseCase) => {
        return new ArchiveVehicleController(archiveVehicleUseCase);
      },
      inject: [ArchiveVehicleUseCase],
    },
  ],
  exports: [
    CustomerManagementInterface
  ],
})
export class CustomerManagementModule {}
