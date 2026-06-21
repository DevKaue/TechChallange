import PrismaVehicleRepository from '@customer-management/domain/contracts/vehicle-repository.interface';
import VehicleFactory from '@customer-management/domain/factories/vehicle.factory';

import CreateVehicleInputDTO from '@customer-management/application/dtos/create-vehicle-input.dto';
import CreateVehicleOutputDTO from '@customer-management/application/dtos/create-vehicle-output.dto';
import VehicleDTO from '@customer-management/application/dtos/vehicle.dto';

import VehicleAlreadyExistsException from '@customer-management/application/exceptions/vehicle-already-exists.exception';

export class CreateVehicleUseCase {
  constructor(
    private readonly vehicleRepository: PrismaVehicleRepository
  ) {}

  async execute(input: CreateVehicleInputDTO): Promise<CreateVehicleOutputDTO> {
    const vehicle = VehicleFactory.create({
      licensePlate: input.licensePlate,
      brand: input.brand,
      model: input.model,
      year: input.year,
      customerId: input.customerId,
    });

    const existingVehicle = await this.vehicleRepository.findByLicensePlate(
      vehicle.licensePlate
    );

    if (existingVehicle) {
      throw new VehicleAlreadyExistsException();
    }

    await this.vehicleRepository.create(vehicle);

    const output: CreateVehicleOutputDTO = {
      vehicle: VehicleDTO.fromDomain(vehicle),
    };

    return output;
  }
}

