import CustomerQueryServiceInterface from '@customer-management/application/contracts/customer-query-service.interface';
import type ListCustomerOutputDTO from '@customer-management/application/dtos/list-customer-output.dto';

export default class ListCustomerUseCase {
  constructor(
    private readonly customerQueryService: CustomerQueryServiceInterface,
  ) {}

  async execute(): Promise<ListCustomerOutputDTO> {
    const customers = await this.customerQueryService.findAll();
    return { customers };
  }
}
