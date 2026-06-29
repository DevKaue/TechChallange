import CustomerQueryServiceInterface from '@customer-management/application/contracts/customer-query-service.interface';
import FindCustomerByIdInputDTO from '@customer-management/application/dtos/find-customer-by-id-input.dto';
import FindCustomerByIdOutputDTO from '@customer-management/application/dtos/find-customer-by-id-output.dto';

export default class FindCustomerByIdUseCase {
  constructor(
    private readonly customerQueryService: CustomerQueryServiceInterface,
  ) {}

  async execute(
    input: FindCustomerByIdInputDTO,
  ): Promise<FindCustomerByIdOutputDTO> {
    const customer = await this.customerQueryService.getById({ id: input.id });

    const output: FindCustomerByIdOutputDTO = {
      customer,
    };

    return output;
  }
}
