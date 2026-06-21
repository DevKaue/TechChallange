import CustomerQueryServiceInterface from '@customer-management/application/contracts/customer-query-service.interface';

import CustomerDTO from '@customer-management/application/dtos/customer.dto';
import FindCustomerByIdInputDTO from '@customer-management/application/dtos/find-customer-by-id-input.dto';
import FindCustomerByIdOutputDTO from '@customer-management/application/dtos/find-customer-by-id-output.dto';

import CustomerNotFoundException from '@customer-management/application/exceptions/customer-not-found.exception';

export default class FindCustomerByIdUseCase {
    constructor(
        private readonly customerQueryService: CustomerQueryServiceInterface
    ) {}

    async execute(input: FindCustomerByIdInputDTO): Promise<FindCustomerByIdOutputDTO> {
        const customer = await this.customerQueryService.findById({ id: input.id });
        if (!customer) {
            throw new CustomerNotFoundException();
        }

        const output: FindCustomerByIdOutputDTO = {
            customer,
        };

        return output;
    }
}
