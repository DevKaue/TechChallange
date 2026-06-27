import VehicleQueryServiceInterface from '@customer-management/application/contracts/vehicle-query-service.interface';
import FindVehicleByIdInputDTO from '@customer-management/application/dtos/find-vehicle-by-id-input.dto';
import FindVehicleByIdOutputDTO from '@customer-management/application/dtos/find-vehicle-by-id-output.dto';

export default class FindVehicleByIdUseCase {
  constructor(
    private readonly vehicleQueryService: VehicleQueryServiceInterface,
  ) {}

  async execute(
    input: FindVehicleByIdInputDTO,
  ): Promise<FindVehicleByIdOutputDTO> {
    const vehicle = await this.vehicleQueryService.getById({ id: input.id });

    const output: FindVehicleByIdOutputDTO = {
      vehicle,
    };

    return output;
  }
}
