import { Module } from '@nestjs/common';
import { PrismaModule } from '@/common/infra/prisma/prisma.module';
import { PART_REPOSITORY } from '@service-orders/domain/acls/part-repository.interface';
import AddMaterialStockUseCase from '@materials/application/usecases/add-material-stock.usecase';
import CreateMaterialUseCase from '@materials/application/usecases/create-material.usecase';
import DeleteMaterialUseCase from '@materials/application/usecases/delete-material.usecase';
import FindMaterialByIdUseCase from '@materials/application/usecases/find-material-by-id.usecase';
import ListMaterialsUseCase from '@materials/application/usecases/list-materials.usecase';
import UpdateMaterialUseCase from '@materials/application/usecases/update-material.usecase';
import MaterialRepositoryInterface from '@materials/domain/contracts/material-repository.interface';
import PrismaMaterialRepository from '@materials/infra/repositories/prisma-material.repository';
import { MaterialsInfraController } from '@materials/infra/controllers/materials.controller';
import AddMaterialStockController from '@materials/presentation/controllers/add-material-stock.controller';
import CreateMaterialController from '@materials/presentation/controllers/create-material.controller';
import DeleteMaterialController from '@materials/presentation/controllers/delete-material.controller';
import FindMaterialByIdController from '@materials/presentation/controllers/find-material-by-id.controller';
import ListMaterialsController from '@materials/presentation/controllers/list-materials.controller';
import UpdateMaterialController from '@materials/presentation/controllers/update-material.controller';

@Module({
  imports: [PrismaModule],
  controllers: [MaterialsInfraController],
  providers: [
    {
      provide: MaterialRepositoryInterface,
      useClass: PrismaMaterialRepository,
    },
    {
      provide: PART_REPOSITORY,
      useExisting: MaterialRepositoryInterface,
    },
    {
      provide: CreateMaterialUseCase,
      useFactory: (repository: MaterialRepositoryInterface) =>
        new CreateMaterialUseCase(repository),
      inject: [MaterialRepositoryInterface],
    },
    {
      provide: ListMaterialsUseCase,
      useFactory: (repository: MaterialRepositoryInterface) =>
        new ListMaterialsUseCase(repository),
      inject: [MaterialRepositoryInterface],
    },
    {
      provide: FindMaterialByIdUseCase,
      useFactory: (repository: MaterialRepositoryInterface) =>
        new FindMaterialByIdUseCase(repository),
      inject: [MaterialRepositoryInterface],
    },
    {
      provide: UpdateMaterialUseCase,
      useFactory: (repository: MaterialRepositoryInterface) =>
        new UpdateMaterialUseCase(repository),
      inject: [MaterialRepositoryInterface],
    },
    {
      provide: AddMaterialStockUseCase,
      useFactory: (repository: MaterialRepositoryInterface) =>
        new AddMaterialStockUseCase(repository),
      inject: [MaterialRepositoryInterface],
    },
    {
      provide: DeleteMaterialUseCase,
      useFactory: (repository: MaterialRepositoryInterface) =>
        new DeleteMaterialUseCase(repository),
      inject: [MaterialRepositoryInterface],
    },
    {
      provide: CreateMaterialController,
      useFactory: (createMaterialUseCase: CreateMaterialUseCase) =>
        new CreateMaterialController(createMaterialUseCase),
      inject: [CreateMaterialUseCase],
    },
    {
      provide: ListMaterialsController,
      useFactory: (listMaterialsUseCase: ListMaterialsUseCase) =>
        new ListMaterialsController(listMaterialsUseCase),
      inject: [ListMaterialsUseCase],
    },
    {
      provide: FindMaterialByIdController,
      useFactory: (findMaterialByIdUseCase: FindMaterialByIdUseCase) =>
        new FindMaterialByIdController(findMaterialByIdUseCase),
      inject: [FindMaterialByIdUseCase],
    },
    {
      provide: UpdateMaterialController,
      useFactory: (updateMaterialUseCase: UpdateMaterialUseCase) =>
        new UpdateMaterialController(updateMaterialUseCase),
      inject: [UpdateMaterialUseCase],
    },
    {
      provide: AddMaterialStockController,
      useFactory: (addMaterialStockUseCase: AddMaterialStockUseCase) =>
        new AddMaterialStockController(addMaterialStockUseCase),
      inject: [AddMaterialStockUseCase],
    },
    {
      provide: DeleteMaterialController,
      useFactory: (deleteMaterialUseCase: DeleteMaterialUseCase) =>
        new DeleteMaterialController(deleteMaterialUseCase),
      inject: [DeleteMaterialUseCase],
    },
  ],
  exports: [PART_REPOSITORY, MaterialRepositoryInterface],
})
export class MaterialsModule {}

