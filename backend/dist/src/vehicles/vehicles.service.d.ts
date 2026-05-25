import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { PrismaService } from '../prisma/prisma.service';
export declare class VehiclesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(createVehicleDto: CreateVehicleDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        plate: string;
        brand: string;
        model: string;
        year: number;
        clientId: string;
    }>;
    findAll(): import("@prisma/client").Prisma.PrismaPromise<({
        client: {
            name: string;
            cpfCnpj: string;
            email: string | null;
            phone: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        plate: string;
        brand: string;
        model: string;
        year: number;
        clientId: string;
    })[]>;
    findOne(id: string): Promise<{
        client: {
            name: string;
            cpfCnpj: string;
            email: string | null;
            phone: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        plate: string;
        brand: string;
        model: string;
        year: number;
        clientId: string;
    }>;
    update(id: string, updateVehicleDto: UpdateVehicleDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        plate: string;
        brand: string;
        model: string;
        year: number;
        clientId: string;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        plate: string;
        brand: string;
        model: string;
        year: number;
        clientId: string;
    }>;
}
