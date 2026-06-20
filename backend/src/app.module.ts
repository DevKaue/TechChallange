import { Module, OnModuleInit } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PartsModule } from './parts/parts.module';
import { CustomerManagementModule } from './customer-management/infra/customer-management.module';
//import { ServiceCatalogModule } from './service-catalog/service-catalog.module';
import { PrismaModule } from './prisma/prisma.module';
import { ServiceOrdersModule } from './service-orders/service-orders.module';
import { AccessIdentityModule } from './access-identity/access-identity.module';
import { validateEnv } from './common/config/env';

@Module({
  imports: [
    PartsModule,
    CustomerManagementModule,
    //ServiceCatalogModule,
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
