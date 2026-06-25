import VehicleQueryServiceInterface from '@customer-management/application/contracts/vehicle-query-service.interface';
import VehicleDTO from '@customer-management/application/dtos/vehicle.dto';

export default class ListVehiclesUseCase {
  constructor(
    private readonly vehicleQueryService: VehicleQueryServiceInterface,
  ) {}

  async execute(props?: { customerId?: string }): Promise<VehicleDTO[]> {
    return this.vehicleQueryService.findAll(props);
  }
}
