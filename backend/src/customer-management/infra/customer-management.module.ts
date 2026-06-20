import { Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma/prisma.module';
import { CustomerController } from '@customer-management/presentation/controllers/customer.controller';
import { CreateCustomerUseCase } from '@customer-management/application/usecases/create-customer.usecase';

import CustomerRepositoryInterface from '@customer-management/domain/contracts/customer-repository.interface';
import PrismaCustomerRepository from '@customer-management/infra/repositories/prisma-customer.repository';

@Module({
  imports: [PrismaModule],
  controllers: [CustomerController],
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
  ],
})
export class CustomerManagementModule {}
