import { Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma/prisma.module';
import { PART_REPOSITORY } from '@service-orders/domain/acls/part-repository.interface';
import AddPartStockUseCase from '@parts/application/usecases/add-part-stock.usecase';
import CreatePartUseCase from '@parts/application/usecases/create-part.usecase';
import DeletePartUseCase from '@parts/application/usecases/delete-part.usecase';
import FindPartByIdUseCase from '@parts/application/usecases/find-part-by-id.usecase';
import ListPartsUseCase from '@parts/application/usecases/list-parts.usecase';
import UpdatePartUseCase from '@parts/application/usecases/update-part.usecase';
import PartRepositoryInterface from '@parts/domain/contracts/part-repository.interface';
import PrismaPartRepository from '@parts/infra/repositories/prisma-part.repository';
import { PartsController } from '@parts/presentation/controllers/parts.controller';

@Module({
  imports: [PrismaModule],
  controllers: [PartsController],
  providers: [
    {
      provide: PartRepositoryInterface,
      useClass: PrismaPartRepository,
    },
    {
      provide: PART_REPOSITORY,
      useExisting: PartRepositoryInterface,
    },
    {
      provide: CreatePartUseCase,
      useFactory: (repository: PartRepositoryInterface) =>
        new CreatePartUseCase(repository),
      inject: [PartRepositoryInterface],
    },
    {
      provide: ListPartsUseCase,
      useFactory: (repository: PartRepositoryInterface) =>
        new ListPartsUseCase(repository),
      inject: [PartRepositoryInterface],
    },
    {
      provide: FindPartByIdUseCase,
      useFactory: (repository: PartRepositoryInterface) =>
        new FindPartByIdUseCase(repository),
      inject: [PartRepositoryInterface],
    },
    {
      provide: UpdatePartUseCase,
      useFactory: (repository: PartRepositoryInterface) =>
        new UpdatePartUseCase(repository),
      inject: [PartRepositoryInterface],
    },
    {
      provide: AddPartStockUseCase,
      useFactory: (repository: PartRepositoryInterface) =>
        new AddPartStockUseCase(repository),
      inject: [PartRepositoryInterface],
    },
    {
      provide: DeletePartUseCase,
      useFactory: (repository: PartRepositoryInterface) =>
        new DeletePartUseCase(repository),
      inject: [PartRepositoryInterface],
    },
  ],
  exports: [PART_REPOSITORY, PartRepositoryInterface],
})
export class PartsModule {}
