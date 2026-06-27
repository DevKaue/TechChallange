import { Injectable } from '@nestjs/common';
import {
  CUSTOMER_REPOSITORY,
  CustomerRepository,
} from '@service-orders/domain/acls/customer-repository.interface';
import CustomerRepositoryInterface from '@customer-management/domain/contracts/customer-repository.interface';

@Injectable()
export class CustomerRepositoryAcl implements CustomerRepository {
  constructor(
    private readonly customerRepository: CustomerRepositoryInterface,
  ) {}

  async findById(id: string): Promise<{
    id: string;
    document: string;
    name: string;
    email: string | null;
    phone: string | null;
  } | null> {
    const customer = await this.customerRepository.findById(id);
    if (!customer) return null;

    return {
      id: customer.id,
      document: customer.document.value,
      name: customer.name,
      email: customer.email?.value ?? null,
      phone: customer.phone ?? null,
    };
  }
}
