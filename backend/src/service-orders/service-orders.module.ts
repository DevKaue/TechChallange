import { Module } from '@nestjs/common';
import { ServiceOrderController } from './presentation/controllers/service-order.controller';
import { EstimateController } from './presentation/controllers/estimate.controller';
import { MechanicController } from './presentation/controllers/mechanic.controller';
import { DiagnosisController } from './presentation/controllers/diagnosis.controller';
import { MetricsController } from './presentation/controllers/metrics.controller';
import { ServiceOrderUseCase } from './application/usecases/service-order.use-case';
import { EstimateUseCase } from './application/usecases/estimate.use-case';
import { MechanicUseCase } from './application/usecases/mechanic.use-case';
import { DiagnosisUseCase } from './application/usecases/diagnosis.use-case';
import { MetricsUseCase } from './application/usecases/metrics.use-case';
import { ServiceOrdersRepositoryInterface } from './domain/contracts/service-orders-repository.interface';
import { PrismaServiceOrdersRepository } from './infra/repositories/prisma-service-orders.repository';
import { PartsModule } from '../parts/infra/parts.module';
// import { CLIENT_REPOSITORY } from './domain/acls/client-repository.interface';
// import { VEHICLE_REPOSITORY } from './domain/acls/vehicle-repository.interface';
// import { USER_REPOSITORY } from './domain/acls/user-repository.interface';
// import { PART_REPOSITORY } from './domain/acls/part-repository.interface';
// import { SERVICE_CATALOG_REPOSITORY } from './domain/acls/service-catalog-repository.interface';

@Module({
  imports: [PartsModule],
  controllers: [
    ServiceOrderController,
    EstimateController,
    MechanicController,
    DiagnosisController,
    MetricsController,
  ],
  providers: [
    ServiceOrderUseCase,
    EstimateUseCase,
    MechanicUseCase,
    DiagnosisUseCase,
    MetricsUseCase,
    {
      provide: ServiceOrdersRepositoryInterface,
      useClass: PrismaServiceOrdersRepository,
    },
    /*
     * ================================================================
     * Providers abaixo serão implementados pelos bounded contexts
     * responsáveis. Enquanto não estiverem prontos, comente-os para
     * evitar erro de bootstrap.
     * ================================================================
     *
     * ---------------------------------------------------------------
     * customer-management
     *   - Implementar PrismaClientRepository que implementa ClientRepository
     *   - Criar CustomerManagementModule exportando CLIENT_REPOSITORY
     *   - Importar CustomerManagementModule aqui ou registrar o provider abaixo
     * ---------------------------------------------------------------
     * {
     *   provide: CLIENT_REPOSITORY,
     *   useClass: PrismaClientRepository,   // classe em customer-management/infra/repositories/
     * },
     *
     * ---------------------------------------------------------------
     * customer-management
     *   - Implementar PrismaVehicleRepository que implementa VehicleRepository
     *   - Criar CustomerManagementModule exportando VEHICLE_REPOSITORY
     * ---------------------------------------------------------------
     * {
     *   provide: VEHICLE_REPOSITORY,
     *   useClass: PrismaVehicleRepository,  // classe em customer-management/infra/repositories/
     * },
     *
     * ---------------------------------------------------------------
     * access-identity
     *   - Implementar PrismaUserRepository que implementa UserRepository
     *     (findById com name/email/role + updateAvailability)
     *   - Exportar USER_REPOSITORY no AccessIdentityModule
     * ---------------------------------------------------------------
     * {
     *   provide: USER_REPOSITORY,
     *   useClass: PrismaUserRepository,     // classe em access-identity/infra/repositories/
     * },
     *
     * ---------------------------------------------------------------
     * parts
     *   - Implementar PrismaPartRepository que implementa PartRepository
     *     (findById + decrementStock)
     *   - Exportar PART_REPOSITORY no PartsModule
     * ---------------------------------------------------------------
     * {
     *   provide: PART_REPOSITORY,
     *   useClass: PrismaPartRepository,    // classe em parts/infra/repositories/
     * },
     *
     * ---------------------------------------------------------------
     * parts
     *   - Implementar PrismaServiceCatalogRepository que implementa
     *     ServiceCatalogRepository (findById)
     *   - Exportar SERVICE_CATALOG_REPOSITORY no PartsModule
     * ---------------------------------------------------------------
     * {
     *   provide: SERVICE_CATALOG_REPOSITORY,
     *   useClass: PrismaServiceCatalogRepository, // classe em parts/infra/repositories/
     * },
     */
  ],
})
export class ServiceOrdersModule {}
