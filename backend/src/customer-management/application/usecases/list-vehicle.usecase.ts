import VehicleQueryServiceInterface from '@customer-management/application/contracts/vehicle-query-service.interface';
import ListVehicleInputDTO from '@customer-management/application/dtos/list-vehicle-input.dto';
import ListVehicleOutputDTO from '@customer-management/application/dtos/list-vehicle-output.dto';

export default class ListVehicleUseCase {
  constructor(
    private readonly vehicleQueryService: VehicleQueryServiceInterface,
  ) {}

  async execute(input: ListVehicleInputDTO): Promise<ListVehicleOutputDTO> {
    const vehicles = await this.vehicleQueryService.findAll({ customerId: input.customerId });
    return new ListVehicleOutputDTO({ vehicles });
  }
}