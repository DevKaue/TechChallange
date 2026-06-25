import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

import CustomerQueryServiceInterface from '@customer-management/application/contracts/customer-query-service.interface';
import CustomerDTO from '@customer-management/application/dtos/customer.dto';

@Injectable()
export default class PrismaCustomerQueryService implements CustomerQueryServiceInterface {
    constructor(private readonly prisma: PrismaService) {}
    
    async findById(props: { id: string }): Promise<CustomerDTO | null> {
        const customerData = await this.prisma.customer.findFirst({
            where: {
                id: props.id,
                deletedAt: null,
            },
        });
        if (customerData) {
            const customerDTO: CustomerDTO = {
                id: customerData.id,
                documentType: customerData.documentType,
                documentNumber: customerData.document,
                name: customerData.name,
                email: customerData.email ?? undefined,
                phone: customerData.phone ?? undefined,
                createdAt: customerData.createdAt,
                updatedAt: customerData.updatedAt,
            };
            return customerDTO;
        }

        return null;
    }
}