import VehicleRepositoryInterface from '@customer-management/domain/contracts/vehicle-repository.interface';
import ArchiveVehicleInputDTO from '@/customer-management/application/dtos/archive-vehicle-input.dto';
import VehicleNotFoundException from '@customer-management/application/exceptions/vehicle-not-found.exception';

export default class ArchiveVehicleUseCase {
  constructor(
    private readonly vehicleRepository: VehicleRepositoryInterface
  ) {}

  async execute(input: ArchiveVehicleInputDTO): Promise<void> {
    const vehicle = await this.vehicleRepository.findById(input.id);

    if (!vehicle) {
      throw new VehicleNotFoundException();
    }

    vehicle.softDelete();

    await this.vehicleRepository.archive(vehicle);
  }
}
