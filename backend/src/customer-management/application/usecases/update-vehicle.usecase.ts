import VehicleRepositoryInterface from '@customer-management/domain/contracts/vehicle-repository.interface';
import Year from '@customer-management/domain/value-objects/year.vo';
import LicensePlate from '@customer-management/domain/value-objects/license-plate.vo';
import UpdateVehicleInputDTO from '@customer-management/application/dtos/update-vehicle-input.dto';
import VehicleDTO from '@customer-management/application/dtos/vehicle.dto';
import VehicleNotFoundException from '@customer-management/domain/exceptions/vehicle-not-found.exception';

export default class UpdateVehicleUseCase {
  constructor(
    private readonly vehicleRepository: VehicleRepositoryInterface,
  ) {}

  async execute(input: UpdateVehicleInputDTO): Promise<VehicleDTO> {
    const vehicle = await this.vehicleRepository.findById(input.id);

    if (!vehicle) {
      throw new VehicleNotFoundException();
    }

    vehicle.update({
      brand: input.brand,
      model: input.model,
      year: input.year !== undefined ? new Year(input.year) : undefined,
      licensePlate:
        input.licensePlate !== undefined
          ? new LicensePlate(input.licensePlate)
          : undefined,
    });

    await this.vehicleRepository.update(vehicle);

    return VehicleDTO.fromDomain(vehicle);
  }
}
