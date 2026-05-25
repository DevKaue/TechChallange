"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceCatalogModule = void 0;
const common_1 = require("@nestjs/common");
const service_catalog_service_1 = require("./service-catalog.service");
const service_catalog_controller_1 = require("./service-catalog.controller");
let ServiceCatalogModule = class ServiceCatalogModule {
};
exports.ServiceCatalogModule = ServiceCatalogModule;
exports.ServiceCatalogModule = ServiceCatalogModule = __decorate([
    (0, common_1.Module)({
        controllers: [service_catalog_controller_1.ServiceCatalogController],
        providers: [service_catalog_service_1.ServiceCatalogService],
    })
], ServiceCatalogModule);
//# sourceMappingURL=service-catalog.module.js.map