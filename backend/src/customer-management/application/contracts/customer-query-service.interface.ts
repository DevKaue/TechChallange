import CustomerDTO from '@customer-management/application/dtos/customer.dto';

export default abstract class CustomerQueryServiceInterface {
    abstract findById(props: { id: string }): Promise<CustomerDTO | null>;
    abstract findAll(): Promise<CustomerDTO[]>;
}