import CustomerDTO from "@/common/dtos/customer.dto";
import VehicleDTO from "@/common/dtos/vehicle.dto";
import FindCustomerByIdUseCase from "@/customer-management/application/usecases/find-customer-by-id.usecase";
import FindCustomerByIdInputDTO from "@/customer-management/application/dtos/find-customer-by-id-input.dto";
import CustomerNotFoundException from "@/customer-management/application/exceptions/customer-not-found.exception";
import FindVehicleByIdUseCase from "@/customer-management/application/usecases/find-vehicle-by-id.usecase";
import VehicleNotFoundException from "@/customer-management/application/exceptions/vehicle-not-found.exception";
import FindVehicleByIdInputDTO from "@/customer-management/application/dtos/find-vehicle-by-id-input.dto";

export default class CustomerManagementFacade {
    constructor(
        private readonly findCustomerByIdUseCase: FindCustomerByIdUseCase,
        private readonly findVehicleByIdUseCase: FindVehicleByIdUseCase
    ) {}

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

    async findVehicleById(prop: { id: string }): Promise<VehicleDTO | null> {
        try {
            const input = new FindVehicleByIdInputDTO({ id: prop.id });
            const output = await this.findVehicleByIdUseCase.execute(input);
            const vehicleDTO = new VehicleDTO(output.vehicle);
            return vehicleDTO;
        } catch (error) {
            if (error instanceof VehicleNotFoundException) {
                return null;
            }
            throw error;
        }
    }
}