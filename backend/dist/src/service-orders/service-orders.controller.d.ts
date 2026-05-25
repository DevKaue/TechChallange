import { ServiceOrdersService } from './service-orders.service';
import { CreateServiceOrderDto } from './dto/create-service-order.dto';
import { UpdateServiceOrderStatusDto } from './dto/update-service-order-status.dto';
import { AddItemToOrderDto } from './dto/add-item-to-order.dto';
export declare class ServiceOrdersController {
    private readonly serviceOrdersService;
    constructor(serviceOrdersService: ServiceOrdersService);
    create(createDto: CreateServiceOrderDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        clientId: string;
        vehicleId: string;
        status: import("@prisma/client").$Enums.ServiceOrderStatus;
        totalPrice: number | null;
        startedExecutionAt: Date | null;
        finishedExecutionAt: Date | null;
    }>;
    findAll(): Promise<({
        client: {
            name: string;
            cpfCnpj: string;
            email: string | null;
            phone: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
        };
        vehicle: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            plate: string;
            brand: string;
            model: string;
            year: number;
            clientId: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        clientId: string;
        vehicleId: string;
        status: import("@prisma/client").$Enums.ServiceOrderStatus;
        totalPrice: number | null;
        startedExecutionAt: Date | null;
        finishedExecutionAt: Date | null;
    })[]>;
    getAverageExecutionTime(): Promise<{
        averageExecutionTimeMinutes: number;
        totalOrdersAnalyzed: number;
        message: string;
    } | {
        averageExecutionTimeMinutes: number;
        totalOrdersAnalyzed: number;
        message?: undefined;
    }>;
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
        vehicle: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            plate: string;
            brand: string;
            model: string;
            year: number;
            clientId: string;
        };
        parts: ({
            part: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                price: number;
                stockQuantity: number;
            };
        } & {
            id: string;
            quantity: number;
            priceAtTime: number;
            serviceOrderId: string;
            partId: string;
        })[];
        services: ({
            serviceCatalog: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                price: number;
            };
        } & {
            id: string;
            quantity: number;
            priceAtTime: number;
            serviceOrderId: string;
            serviceCatalogId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        clientId: string;
        vehicleId: string;
        status: import("@prisma/client").$Enums.ServiceOrderStatus;
        totalPrice: number | null;
        startedExecutionAt: Date | null;
        finishedExecutionAt: Date | null;
    }>;
    updateStatus(id: string, updateDto: UpdateServiceOrderStatusDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        clientId: string;
        vehicleId: string;
        status: import("@prisma/client").$Enums.ServiceOrderStatus;
        totalPrice: number | null;
        startedExecutionAt: Date | null;
        finishedExecutionAt: Date | null;
    }>;
    addService(id: string, addDto: AddItemToOrderDto): Promise<{
        id: string;
        quantity: number;
        priceAtTime: number;
        serviceOrderId: string;
        serviceCatalogId: string;
    }>;
    addPart(id: string, addDto: AddItemToOrderDto): Promise<{
        id: string;
        quantity: number;
        priceAtTime: number;
        serviceOrderId: string;
        partId: string;
    }>;
    generateBudget(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        clientId: string;
        vehicleId: string;
        status: import("@prisma/client").$Enums.ServiceOrderStatus;
        totalPrice: number | null;
        startedExecutionAt: Date | null;
        finishedExecutionAt: Date | null;
    }>;
}
