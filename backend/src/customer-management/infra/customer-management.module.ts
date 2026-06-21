import { Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma/prisma.module';
import { CustomerController } from '@customer-management/presentation/controllers/customer.controller';
import { VehicleController } from '@customer-management/presentation/controllers/vehicle.controller';
import { CreateCustomerUseCase } from '@customer-management/application/usecases/create-customer.usecase';
import { CreateVehicleUseCase } from '@customer-management/application/usecases/create-vehicle.usecase';

import CustomerRepositoryInterface from '@customer-management/domain/contracts/customer-repository.interface';
import VehicleRepositoryInterface from '@customer-management/domain/contracts/vehicle-repository.interface';
import PrismaCustomerRepository from '@customer-management/infra/repositories/prisma-customer.repository';
import PrismaVehicleRepository from '@customer-management/infra/repositories/prisma-vehicle.repository';

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
  ],
})
export class CustomerManagementModule {}
