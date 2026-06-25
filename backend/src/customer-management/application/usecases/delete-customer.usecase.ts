import CustomerRepositoryInterface from '@customer-management/domain/contracts/customer-repository.interface';
import DeleteCustomerInputDTO from '@customer-management/application/dtos/delete-customer-input.dto';
import CustomerNotFoundException from '@customer-management/application/exceptions/customer-not-found.exception';

export default class DeleteCustomerUseCase {
  constructor(
    private readonly customerRepository: CustomerRepositoryInterface,
  ) {}

  async execute(input: DeleteCustomerInputDTO): Promise<void> {
    const customer = await this.customerRepository.findById(input.id);

    if (!customer) {
      throw new CustomerNotFoundException();
    }

    await this.customerRepository.delete(customer.id);
  }
}
