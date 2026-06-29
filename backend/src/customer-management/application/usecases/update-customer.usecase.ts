import CustomerRepositoryInterface from '@customer-management/domain/contracts/customer-repository.interface';
import Email from '@customer-management/domain/value-objects/email.vo';
import UpdateCustomerInputDTO from '@customer-management/application/dtos/update-customer-input.dto';
import CustomerDTO from '@customer-management/application/dtos/customer.dto';
import UpdateCustomerOutputDTO from '@customer-management/application/dtos/update-customer-output.dto';

export default class UpdateCustomerUseCase {
  constructor(
    private readonly customerRepository: CustomerRepositoryInterface,
  ) {}

  async execute(
    input: UpdateCustomerInputDTO,
  ): Promise<UpdateCustomerOutputDTO> {
    const customer = await this.customerRepository.getById(input.id);

    if (input.name != null) {
      customer.changeName(input.name);
    }

    if (input.phone !== undefined) {
      customer.changePhone(input.phone ?? undefined);
    }

    if (input.email !== undefined) {
      customer.changeEmail(
        input.email !== null ? new Email(input.email) : undefined,
      );
    }

    await this.customerRepository.update(customer);

    return new UpdateCustomerOutputDTO({
      customer: CustomerDTO.fromDomain(customer),
    });
  }
}
