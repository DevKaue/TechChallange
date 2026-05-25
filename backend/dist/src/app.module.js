"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const clients_module_1 = require("./clients/clients.module");
const vehicles_module_1 = require("./vehicles/vehicles.module");
const parts_module_1 = require("./parts/parts.module");
const service_catalog_module_1 = require("./service-catalog/service-catalog.module");
const prisma_module_1 = require("./prisma/prisma.module");
const service_orders_module_1 = require("./service-orders/service-orders.module");
const auth_module_1 = require("./auth/auth.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [clients_module_1.ClientsModule, vehicles_module_1.VehiclesModule, parts_module_1.PartsModule, service_catalog_module_1.ServiceCatalogModule, prisma_module_1.PrismaModule, service_orders_module_1.ServiceOrdersModule, auth_module_1.AuthModule],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map