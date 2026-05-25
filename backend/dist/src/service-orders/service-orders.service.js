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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceOrdersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let ServiceOrdersService = class ServiceOrdersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createDto) {
        const vehicle = await this.prisma.vehicle.findUnique({
            where: { id: createDto.vehicleId },
        });
        if (!vehicle) {
            throw new common_1.NotFoundException('Vehicle not found');
        }
        if (vehicle.clientId !== createDto.clientId) {
            throw new common_1.ConflictException('Vehicle does not belong to the specified client');
        }
        return this.prisma.serviceOrder.create({
            data: {
                clientId: createDto.clientId,
                vehicleId: createDto.vehicleId,
                status: client_1.ServiceOrderStatus.RECEIVED,
            },
        });
    }
    async findAll() {
        return this.prisma.serviceOrder.findMany({
            include: {
                client: true,
                vehicle: true,
            },
        });
    }
    async findOne(id) {
        const serviceOrder = await this.prisma.serviceOrder.findUnique({
            where: { id },
            include: {
                client: true,
                vehicle: true,
                services: { include: { serviceCatalog: true } },
                parts: { include: { part: true } },
            },
        });
        if (!serviceOrder) {
            throw new common_1.NotFoundException(`Service Order ${id} not found`);
        }
        return serviceOrder;
    }
    async updateStatus(id, updateDto) {
        const serviceOrder = await this.findOne(id);
        const dataToUpdate = { status: updateDto.status };
        if (updateDto.status === client_1.ServiceOrderStatus.IN_PROGRESS && !serviceOrder.startedExecutionAt) {
            dataToUpdate.startedExecutionAt = new Date();
        }
        else if (updateDto.status === client_1.ServiceOrderStatus.FINISHED && !serviceOrder.finishedExecutionAt) {
            dataToUpdate.finishedExecutionAt = new Date();
        }
        return this.prisma.serviceOrder.update({
            where: { id },
            data: dataToUpdate,
        });
    }
    async addService(orderId, addDto) {
        const serviceOrder = await this.findOne(orderId);
        if (serviceOrder.status !== client_1.ServiceOrderStatus.RECEIVED && serviceOrder.status !== client_1.ServiceOrderStatus.IN_DIAGNOSTICS) {
            throw new common_1.BadRequestException('Cannot add services to an order that is already approved or further.');
        }
        const catalogService = await this.prisma.serviceCatalog.findUnique({
            where: { id: addDto.itemId },
        });
        if (!catalogService) {
            throw new common_1.NotFoundException('Service not found in catalog');
        }
        return this.prisma.serviceOrderItem.create({
            data: {
                serviceOrderId: orderId,
                serviceCatalogId: catalogService.id,
                quantity: addDto.quantity,
                priceAtTime: catalogService.price,
            },
        });
    }
    async addPart(orderId, addDto) {
        const serviceOrder = await this.findOne(orderId);
        if (serviceOrder.status !== client_1.ServiceOrderStatus.RECEIVED && serviceOrder.status !== client_1.ServiceOrderStatus.IN_DIAGNOSTICS) {
            throw new common_1.BadRequestException('Cannot add parts to an order that is already approved or further.');
        }
        const part = await this.prisma.part.findUnique({
            where: { id: addDto.itemId },
        });
        if (!part) {
            throw new common_1.NotFoundException('Part not found');
        }
        if (part.stockQuantity < addDto.quantity) {
            throw new common_1.ConflictException(`Insufficient stock for part ${part.name}. Available: ${part.stockQuantity}`);
        }
        await this.prisma.part.update({
            where: { id: part.id },
            data: { stockQuantity: { decrement: addDto.quantity } },
        });
        return this.prisma.serviceOrderPart.create({
            data: {
                serviceOrderId: orderId,
                partId: part.id,
                quantity: addDto.quantity,
                priceAtTime: part.price,
            },
        });
    }
    async generateBudget(id) {
        const order = await this.findOne(id);
        const servicesTotal = order.services.reduce((acc, item) => acc + (item.priceAtTime * item.quantity), 0);
        const partsTotal = order.parts.reduce((acc, item) => acc + (item.priceAtTime * item.quantity), 0);
        const totalPrice = servicesTotal + partsTotal;
        const updatedOrder = await this.prisma.serviceOrder.update({
            where: { id },
            data: {
                totalPrice,
                status: client_1.ServiceOrderStatus.WAITING_APPROVAL
            },
        });
        return updatedOrder;
    }
    async getAverageExecutionTime() {
        const finishedOrders = await this.prisma.serviceOrder.findMany({
            where: {
                status: { in: [client_1.ServiceOrderStatus.FINISHED, client_1.ServiceOrderStatus.DELIVERED] },
                startedExecutionAt: { not: null },
                finishedExecutionAt: { not: null },
            },
            select: {
                startedExecutionAt: true,
                finishedExecutionAt: true,
            },
        });
        if (finishedOrders.length === 0) {
            return {
                averageExecutionTimeMinutes: 0,
                totalOrdersAnalyzed: 0,
                message: 'Nenhuma ordem de serviço finalizada ou entregue para calcular a média.',
            };
        }
        let totalDurationMs = 0;
        for (const order of finishedOrders) {
            const start = new Date(order.startedExecutionAt).getTime();
            const end = new Date(order.finishedExecutionAt).getTime();
            totalDurationMs += (end - start);
        }
        const averageDurationMinutes = (totalDurationMs / finishedOrders.length) / (1000 * 60);
        return {
            averageExecutionTimeMinutes: parseFloat(averageDurationMinutes.toFixed(2)),
            totalOrdersAnalyzed: finishedOrders.length,
        };
    }
};
exports.ServiceOrdersService = ServiceOrdersService;
exports.ServiceOrdersService = ServiceOrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ServiceOrdersService);
//# sourceMappingURL=service-orders.service.js.map