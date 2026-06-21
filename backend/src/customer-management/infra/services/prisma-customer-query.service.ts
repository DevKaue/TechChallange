import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

import CustomerQueryServiceInterface from '@customer-management/application/contracts/customer-query-service.interface';
import CustomerDTO from '@customer-management/application/dtos/customer.dto';

@Injectable()
export default class PrismaCustomerQueryService implements CustomerQueryServiceInterface {
    constructor(private readonly prisma: PrismaService) {}
    
    async findById(props: { id: string }): Promise<CustomerDTO | null> {
        const customer = await this.prisma.customer.findUnique({
            where: { id: props.id },
        });
        if (customer) {
            const customerDTO: CustomerDTO = {
                id: customer.id,
                documentType: customer.documentType,
                documentNumber: customer.document,
                name: customer.name,
                email: customer.email ?? undefined,
                phone: customer.phone ?? undefined,
                createdAt: customer.createdAt,
                updatedAt: customer.updatedAt,
            };
            return customerDTO;
        }

        return null;
    }
}