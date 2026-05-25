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
exports.PartsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PartsService = class PartsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createPartDto) {
        return this.prisma.part.create({
            data: createPartDto,
        });
    }
    async findAll() {
        return this.prisma.part.findMany();
    }
    async findOne(id) {
        const part = await this.prisma.part.findUnique({
            where: { id },
        });
        if (!part) {
            throw new common_1.NotFoundException(`Part with ID ${id} not found`);
        }
        return part;
    }
    async update(id, updatePartDto) {
        await this.findOne(id);
        return this.prisma.part.update({
            where: { id },
            data: updatePartDto,
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.part.delete({
            where: { id },
        });
    }
};
exports.PartsService = PartsService;
exports.PartsService = PartsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PartsService);
//# sourceMappingURL=parts.service.js.map