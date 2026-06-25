import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import Customer from  "@customer-management/domain/entities/customer.entity";
import CustomerFactory from '@customer-management/domain/factories/customer.factory';
import Document from "@customer-management/domain/value-objects/document.vo";
import Email from "@customer-management/domain/value-objects/email.vo";
import CustomerRepositoryInterface from "@customer-management/domain/contracts/customer-repository.interface";

@Injectable()
export default class PrismaCustomerRepository implements CustomerRepositoryInterface {
    constructor(private readonly prisma: PrismaService) {}
    
    async findById(id: string): Promise<Customer | null> {
        const customerData = await this.prisma.customer.findFirst({
            where: {
                id: id,
                deletedAt: null,
            },
        });

        if (!customerData) {
            return null;
        }

        return CustomerFactory.create({
            id: customerData.id,
            documentType: customerData.documentType,
            documentNumber: customerData.document,
            name: customerData.name,
            email: customerData.email ?? undefined,
            phone: customerData.phone ?? undefined,
            createdAt: customerData.createdAt,
            updatedAt: customerData.updatedAt,
        });
    }

    async findByDocument(document: Document): Promise<Customer | null> {
        const customerData = await this.prisma.customer.findFirst({
            where: {
                document: document.value,
                documentType: document.type,
                deletedAt: null,
            },
        });

        if (!customerData) {
            return null;
        }
        
        return CustomerFactory.create({
            id: customerData.id,
            documentType: customerData.documentType,
            documentNumber: customerData.document,
            name: customerData.name,
            email: customerData.email ?? undefined,
            phone: customerData.phone ?? undefined,
            createdAt: customerData.createdAt,
            updatedAt: customerData.updatedAt,
        });
    }

    async create(customer: Customer): Promise<void> {
        await this.prisma.customer.create({
            data: {
                id: customer.id,
                document: customer.document.value,
                documentType: customer.document.type,
                name: customer.name,
                email: customer.email?.value,
                phone: customer.phone,
                createdAt: customer.createdAt,
                updatedAt: customer.updatedAt,
            },
        });
    }

    async update(customer: Customer): Promise<void> {
        await this.prisma.customer.update({
            where: { id: customer.id },
            data: {
                name: customer.name,
                email: customer.email?.value ?? null,
                phone: customer.phone ?? null,
                updatedAt: customer.updatedAt,
            },
        });
    }

    async delete(id: string): Promise<void> {
        // Exclusão lógica (soft delete): preserva histórico do cliente.
        await this.prisma.customer.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
}