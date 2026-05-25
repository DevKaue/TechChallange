import { CreateServiceCatalogDto } from './dto/create-service-catalog.dto';
import { UpdateServiceCatalogDto } from './dto/update-service-catalog.dto';
import { PrismaService } from '../prisma/prisma.service';
export declare class ServiceCatalogService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createServiceCatalogDto: CreateServiceCatalogDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        price: number;
    }>;
    findAll(): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        price: number;
    }[]>;
    findOne(id: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        price: number;
    }>;
    update(id: string, updateServiceCatalogDto: UpdateServiceCatalogDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        price: number;
    }>;
    remove(id: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        price: number;
    }>;
}
