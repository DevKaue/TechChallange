import { Module, OnModuleInit } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MaterialsModule } from './materials/infra/materials.module';
import { CustomerManagementModule } from './customer-management/infra/customer-management.module';
import { ServiceCatalogModule } from './service-catalog/infra/service-catalog.module';
import { PrismaModule } from './common/infra/prisma/prisma.module';
import { ServiceOrdersModule } from './service-orders/service-orders.module';
import { AccessIdentityModule } from './access-identity/access-identity.module';
import { validateEnv } from './common/infra/config/env';

@Module({
  imports: [
    MaterialsModule,
    CustomerManagementModule,
    ServiceCatalogModule,
    PrismaModule,
    ServiceOrdersModule,
    AccessIdentityModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnModuleInit {
  onModuleInit() {
    validateEnv();
  }
}
