import CustomerRepositoryInterface from '@customer-management/domain/contracts/customer-repository.interface';
import CustomerFactory from '@customer-management/domain/factories/customer.factory';

import CreateCustomerInputDTO from '@customer-management/application/dtos/create-customer-input.dto';
import CreateCustomerOutputDTO from '@customer-management/application/dtos/create-customer-output.dto';
import CustomerDTO from '@customer-management/application/dtos/customer.dto';

import CustomerRegistrationChecker from '@/customer-management/domain/services/customer-registration-checker.service';

export default class CreateCustomerUseCase {
  constructor(
    private readonly customerRepository: CustomerRepositoryInterface,
    private readonly registrationChecker: CustomerRegistrationChecker
  ) {}

  async execute(input: CreateCustomerInputDTO): Promise<CreateCustomerOutputDTO> {
    const customer = CustomerFactory.create({
      documentType: input.documentType,
      documentNumber: input.documentNumber,
      name: input.name,
      email: input.email,
      phone: input.phone,
    });

    await this.registrationChecker.checkUniqueness(customer.document);

    await this.customerRepository.create(customer);

    const output: CreateCustomerOutputDTO = {
      customer: CustomerDTO.fromDomain(customer),
    };

    return output;
  }
}
