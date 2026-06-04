import { Module, OnModuleInit } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientsModule } from './clients/clients.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { PartsModule } from './parts/parts.module';
import { ServiceCatalogModule } from './service-catalog/service-catalog.module';
import { PrismaModule } from './prisma/prisma.module';
import { ServiceOrdersModule } from './service-orders/service-orders.module';
import { AuthModule } from './auth/auth.module';
import { validateEnv } from './common/config/env';

@Module({
  imports: [
    ClientsModule,
    VehiclesModule,
    PartsModule,
    ServiceCatalogModule,
    PrismaModule,
    ServiceOrdersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnModuleInit {
  onModuleInit() {
    validateEnv();
  }
}
