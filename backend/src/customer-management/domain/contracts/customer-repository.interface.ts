import Customer from "@customer-management/domain/entities/customer.entity";
import Document from "@customer-management/domain/value-objects/document.vo";

export default abstract class CustomerRepositoryInterface {
    abstract findById(id: string): Promise<Customer | null>;
    abstract findByDocument(document: Document): Promise<Customer | null>;
    abstract create(customer: Customer): Promise<void>;
    abstract update(customer: Customer): Promise<void>;
    abstract delete(id: string): Promise<void>;
}