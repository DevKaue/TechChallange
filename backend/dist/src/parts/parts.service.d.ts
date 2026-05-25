import { CreatePartDto } from './dto/create-part.dto';
import { UpdatePartDto } from './dto/update-part.dto';
import { PrismaService } from '../prisma/prisma.service';
export declare class PartsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createPartDto: CreatePartDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        price: number;
        stockQuantity: number;
    }>;
    findAll(): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        price: number;
        stockQuantity: number;
    }[]>;
    findOne(id: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        price: number;
        stockQuantity: number;
    }>;
    update(id: string, updatePartDto: UpdatePartDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        price: number;
        stockQuantity: number;
    }>;
    remove(id: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        price: number;
        stockQuantity: number;
    }>;
}
