import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import Customer from  "@customer-management/domain/entities/customer.entity";
import CustomerFactory from '@customer-management/domain/factories/customer.factory';
import Document from "@customer-management/domain/value-objects/document.vo";
import Email from "@customer-management/domain/value-objects/email.vo";
import CustomerRepositoryInterface from "@customer-management/domain/contracts/customer-repository.interface";
import { create } from 'domain';

@Injectable()
export default class PrismaCustomerRepository implements CustomerRepositoryInterface {
    constructor(private readonly prisma: PrismaService) {}
    
    async find(id: string): Promise<Customer | null> {
        // Implement the logic to find a customer by ID in the database
        // Return the customer object if found, otherwise return null
        return null; // Placeholder implementation
    }

    async findByDocument(document: Document): Promise<Customer | null> {
        const customerData = await this.prisma.customer.findUnique({
            where: {
                uq_customer_document: {
                    document: document.value,
                    documentType: document.type,
                },
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
        // Implement the logic to update a customer in the database
    }

    async delete(id: string): Promise<void> {
        // Implement the logic to delete a customer from the database by ID
    }
}