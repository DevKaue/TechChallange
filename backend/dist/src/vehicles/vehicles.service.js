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
exports.VehiclesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let VehiclesService = class VehiclesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createVehicleDto) {
        const exists = await this.prisma.vehicle.findUnique({
            where: { plate: createVehicleDto.plate },
        });
        if (exists) {
            throw new common_1.ConflictException('Já existe um veículo cadastrado com esta placa');
        }
        const client = await this.prisma.client.findUnique({
            where: { id: createVehicleDto.clientId },
        });
        if (!client) {
            throw new common_1.NotFoundException('Cliente não encontrado');
        }
        return this.prisma.vehicle.create({
            data: createVehicleDto,
        });
    }
    findAll() {
        return this.prisma.vehicle.findMany({
            include: { client: true },
        });
    }
    async findOne(id) {
        const vehicle = await this.prisma.vehicle.findUnique({
            where: { id },
            include: { client: true },
        });
        if (!vehicle)
            throw new common_1.NotFoundException('Veículo não encontrado');
        return vehicle;
    }
    async update(id, updateVehicleDto) {
        await this.findOne(id);
        return this.prisma.vehicle.update({
            where: { id },
            data: updateVehicleDto,
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.vehicle.delete({
            where: { id },
        });
    }
};
exports.VehiclesService = VehiclesService;
exports.VehiclesService = VehiclesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], VehiclesService);
//# sourceMappingURL=vehicles.service.js.map