"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceOrdersController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const service_orders_service_1 = require("./service-orders.service");
const create_service_order_dto_1 = require("./dto/create-service-order.dto");
const update_service_order_status_dto_1 = require("./dto/update-service-order-status.dto");
const add_item_to_order_dto_1 = require("./dto/add-item-to-order.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const swagger_1 = require("@nestjs/swagger");
let ServiceOrdersController = class ServiceOrdersController {
    serviceOrdersService;
    constructor(serviceOrdersService) {
        this.serviceOrdersService = serviceOrdersService;
    }
    create(createDto) {
        return this.serviceOrdersService.create(createDto);
    }
    findAll() {
        return this.serviceOrdersService.findAll();
    }
    getAverageExecutionTime() {
        return this.serviceOrdersService.getAverageExecutionTime();
    }
    findOne(id) {
        return this.serviceOrdersService.findOne(id);
    }
    updateStatus(id, updateDto) {
        return this.serviceOrdersService.updateStatus(id, updateDto);
    }
    addService(id, addDto) {
        return this.serviceOrdersService.addService(id, addDto);
    }
    addPart(id, addDto) {
        return this.serviceOrdersService.addPart(id, addDto);
    }
    generateBudget(id) {
        return this.serviceOrdersService.generateBudget(id);
    }
};
exports.ServiceOrdersController = ServiceOrdersController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_service_order_dto_1.CreateServiceOrderDto]),
    __metadata("design:returntype", void 0)
], ServiceOrdersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    openapi.ApiResponse({ status: 200, type: [Object] }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ServiceOrdersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('metrics/average-time'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    openapi.ApiResponse({ status: 200, type: Object }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ServiceOrdersController.prototype, "getAverageExecutionTime", null);
__decorate([
    (0, common_1.Get)(':id'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ServiceOrdersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_service_order_status_dto_1.UpdateServiceOrderStatusDto]),
    __metadata("design:returntype", void 0)
], ServiceOrdersController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Post)(':id/services'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, add_item_to_order_dto_1.AddItemToOrderDto]),
    __metadata("design:returntype", void 0)
], ServiceOrdersController.prototype, "addService", null);
__decorate([
    (0, common_1.Post)(':id/parts'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, add_item_to_order_dto_1.AddItemToOrderDto]),
    __metadata("design:returntype", void 0)
], ServiceOrdersController.prototype, "addPart", null);
__decorate([
    (0, common_1.Patch)(':id/budget'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ServiceOrdersController.prototype, "generateBudget", null);
exports.ServiceOrdersController = ServiceOrdersController = __decorate([
    (0, swagger_1.ApiTags)('Service Orders'),
    (0, common_1.Controller)('service-orders'),
    __metadata("design:paramtypes", [service_orders_service_1.ServiceOrdersService])
], ServiceOrdersController);
//# sourceMappingURL=service-orders.controller.js.map