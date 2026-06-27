import VehicleRepositoryInterface from '@customer-management/domain/contracts/vehicle-repository.interface';
import CustomerRepositoryInterface from '@/customer-management/domain/contracts/customer-repository.interface';

import VehicleFactory from '@customer-management/domain/factories/vehicle.factory';

import CreateVehicleInputDTO from '@customer-management/application/dtos/create-vehicle-input.dto';
import CreateVehicleOutputDTO from '@customer-management/application/dtos/create-vehicle-output.dto';
import VehicleDTO from '@customer-management/application/dtos/vehicle.dto';

import VehicleRegistrationChecker from '@/customer-management/domain/services/vehicle-registration-checker.service';

export class CreateVehicleUseCase {
  constructor(
    private readonly vehicleRepository: VehicleRepositoryInterface,
    private readonly customerRepository: CustomerRepositoryInterface,
    private readonly registrationChecker: VehicleRegistrationChecker,
  ) {}

  async execute(input: CreateVehicleInputDTO): Promise<CreateVehicleOutputDTO> {
    const existingCustomer = await this.customerRepository.getById(
      input.customerId,
    );

    const vehicle = VehicleFactory.create({
      licensePlate: input.licensePlate,
      brand: input.brand,
      model: input.model,
      year: input.year,
      customerId: existingCustomer.id,
    });

    await this.registrationChecker.checkUniqueness(vehicle.licensePlate);

    await this.vehicleRepository.create(vehicle);

    const output: CreateVehicleOutputDTO = {
      vehicle: VehicleDTO.fromDomain(vehicle),
    };

    return output;
  }
}
