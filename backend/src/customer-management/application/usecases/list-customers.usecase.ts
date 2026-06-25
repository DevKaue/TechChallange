import CustomerQueryServiceInterface from '@customer-management/application/contracts/customer-query-service.interface';
import CustomerDTO from '@customer-management/application/dtos/customer.dto';

export default class ListCustomersUseCase {
  constructor(
    private readonly customerQueryService: CustomerQueryServiceInterface,
  ) {}

  async execute(): Promise<CustomerDTO[]> {
    return this.customerQueryService.findAll();
  }
}
