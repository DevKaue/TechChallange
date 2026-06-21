import CustomerDTO from "@/common/dtos/customer.dto";
import FindCustomerByIdUseCase from "@/customer-management/application/usecases/find-customer-by-id.usecase";
import FindCustomerByIdInputDTO from "@/customer-management/application/dtos/find-customer-by-id-input.dto";
import CustomerNotFoundException from "@/customer-management/application/exceptions/customer-not-found.exception";

export default class CustomerManagementFacade {
    constructor(private readonly findCustomerByIdUseCase: FindCustomerByIdUseCase) {}

    async findCustomerById(prop: { id: string }): Promise<CustomerDTO | null> {
        try {
            const input = new FindCustomerByIdInputDTO({ id: prop.id });
            const output = await this.findCustomerByIdUseCase.execute(input);
            const customerDTO = new CustomerDTO(output.customer);
            return customerDTO;
        } catch (error) {
            if (error instanceof CustomerNotFoundException) {
                return null;
            }
            throw error;
        }
    }
}