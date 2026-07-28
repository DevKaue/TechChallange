import VehicleRepositoryInterface from '@customer-management/domain/contracts/vehicle-repository.interface';
import type ArchiveVehicleInputDTO from '@/customer-management/application/dtos/archive-vehicle-input.dto';

export default class ArchiveVehicleUseCase {
  constructor(private readonly vehicleRepository: VehicleRepositoryInterface) {}

  async execute(input: ArchiveVehicleInputDTO): Promise<void> {
    const vehicle = await this.vehicleRepository.getById(input.id);

    vehicle.softDelete();

    await this.vehicleRepository.archive(vehicle);
  }
}
