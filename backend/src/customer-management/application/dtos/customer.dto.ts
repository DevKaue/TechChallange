import Customer from "@/customer-management/domain/entities/customer.entity";

export default class CustomerDTO {
    id!: string;  
    documentType!: string;
    documentNumber!: string;
    name!: string;
    phone?: string;
    email?: string;
    createdAt!: Date;
    updatedAt?: Date;

    constructor(init?: Partial<CustomerDTO>) {
        Object.assign(this, init);
    }

    static fromDomain(entity: Customer): CustomerDTO {
        return new CustomerDTO({
        id: entity.id,
        documentType: entity.document.type,
        documentNumber: entity.document.value,
        name: entity.name,
        email: entity.email?.value,
        phone: entity.phone,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
      });
    }
}