import CustomerRepositoryInterface from '@customer-management/domain/contracts/customer-repository.interface';
import Email from '@customer-management/domain/value-objects/email.vo';
import UpdateCustomerInputDTO from '@customer-management/application/dtos/update-customer-input.dto';
import CustomerDTO from '@customer-management/application/dtos/customer.dto';
import CustomerNotFoundException from '@customer-management/application/exceptions/customer-not-found.exception';

export default class UpdateCustomerUseCase {
  constructor(
    private readonly customerRepository: CustomerRepositoryInterface,
  ) {}

  async execute(input: UpdateCustomerInputDTO): Promise<CustomerDTO> {
    const customer = await this.customerRepository.findById(input.id);

    if (!customer) {
      throw new CustomerNotFoundException();
    }

    customer.update({
      name: input.name,
      phone: input.phone,
      email: input.email !== undefined ? new Email(input.email) : undefined,
    });

    await this.customerRepository.update(customer);

    return CustomerDTO.fromDomain(customer);
  }
}
