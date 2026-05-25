import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
export declare class ClientsController {
    private readonly clientsService;
    constructor(clientsService: ClientsService);
    create(createClientDto: CreateClientDto): Promise<{
        name: string;
        cpfCnpj: string;
        email: string | null;
        phone: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(): import("@prisma/client").Prisma.PrismaPromise<{
        name: string;
        cpfCnpj: string;
        email: string | null;
        phone: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        name: string;
        cpfCnpj: string;
        email: string | null;
        phone: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, updateClientDto: UpdateClientDto): Promise<{
        name: string;
        cpfCnpj: string;
        email: string | null;
        phone: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        name: string;
        cpfCnpj: string;
        email: string | null;
        phone: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
