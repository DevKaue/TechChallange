import VehicleQueryServiceInterface from '@customer-management/application/contracts/vehicle-query-service.interface';

import FindVehicleByIdInputDTO from '@customer-management/application/dtos/find-vehicle-by-id-input.dto';
import FindVehicleByIdOutputDTO from '@customer-management/application/dtos/find-vehicle-by-id-output.dto';

import VehicleNotFoundException from '@customer-management/application/exceptions/vehicle-not-found.exception';

export default class FindVehicleByIdUseCase {
    constructor(
        private readonly vehicleQueryService: VehicleQueryServiceInterface
    ) {}

    async execute(input: FindVehicleByIdInputDTO): Promise<FindVehicleByIdOutputDTO> {
        const vehicle = await this.vehicleQueryService.findById({ id: input.id });
        if (!vehicle) {
            throw new VehicleNotFoundException();
        }

        const output: FindVehicleByIdOutputDTO = {
            vehicle,
        };

        return output;
    }
}
