import VehicleRepositoryInterface from '@customer-management/domain/contracts/vehicle-repository.interface';
import Year from '@customer-management/domain/value-objects/year.vo';
import LicensePlate from '@customer-management/domain/value-objects/license-plate.vo';
import type UpdateVehicleInputDTO from '@customer-management/application/dtos/update-vehicle-input.dto';
import { toVehicleDTO } from '@customer-management/application/dtos/vehicle.dto';
import VehicleRegistrationChecker from '@/customer-management/domain/services/vehicle-registration-checker.service';
import type UpdateVehicleOutputDTO from '@customer-management/application/dtos/update-vehicle-output.dto';

export default class UpdateVehicleUseCase {
  constructor(
    private readonly vehicleRepository: VehicleRepositoryInterface,
    private readonly registrationChecker: VehicleRegistrationChecker,
  ) {}

  async execute(input: UpdateVehicleInputDTO): Promise<UpdateVehicleOutputDTO> {
    const vehicle = await this.vehicleRepository.getById(input.id);

    if (input.licensePlate != null) {
      const newLicensePlate = new LicensePlate(input.licensePlate);
      if (!vehicle.licensePlate.equals(newLicensePlate)) {
        await this.registrationChecker.checkUniqueness(newLicensePlate);
        vehicle.changeLicensePlate(newLicensePlate);
      }
    }

    if (input.brand !== undefined) vehicle.changeBrand(input.brand);
    if (input.model !== undefined) vehicle.changeModel(input.model);

    if (input.year != null) {
      vehicle.changeYear(new Year(input.year));
    }

    await this.vehicleRepository.update(vehicle);

    const output: UpdateVehicleOutputDTO = {
      vehicle: toVehicleDTO(vehicle),
    };
    return output;
  }
}
