import { Injectable } from '@nestjs/common';
import {
  VEHICLE_REPOSITORY,
  VehicleRepository,
} from '@service-orders/domain/acls/vehicle-repository.interface';
import VehicleRepositoryInterface from '@customer-management/domain/contracts/vehicle-repository.interface';

@Injectable()
export class VehicleRepositoryAcl implements VehicleRepository {
  constructor(private readonly vehicleRepository: VehicleRepositoryInterface) {}

  async findById(id: string): Promise<{
    id: string;
    plate: string;
    brand: string;
    model: string;
    year: number;
    customerId: string;
  } | null> {
    const vehicle = await this.vehicleRepository.findById(id);
    if (!vehicle) return null;

    return {
      id: vehicle.id,
      plate: vehicle.licensePlate.value,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year.value,
      customerId: vehicle.customerId,
    };
  }
}
