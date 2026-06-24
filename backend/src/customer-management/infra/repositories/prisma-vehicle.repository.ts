import { Injectable } from '@nestjs/common';
import Vehicle from '@customer-management/domain/entities/vehicle.entity';
import VehicleFactory from '@customer-management/domain/factories/vehicle.factory';
import LicensePlate from '@customer-management/domain/value-objects/license-plate.vo';
import VehicleRepositoryInterface from '@customer-management/domain/contracts/vehicle-repository.interface';
import PrismaUnitOfWorkService from '@customer-management/infra/services/prisma-unit-of-work.service';

@Injectable()
export default class PrismaVehicleRepository implements VehicleRepositoryInterface {
  constructor(private readonly uow: PrismaUnitOfWorkService) {}

  async findById(id: string): Promise<Vehicle | null> {
    const vehicleData = await this.uow.client.vehicle.findFirst({
      where: {
        id: id,
        deletedAt: null,
      },
    });

    if (!vehicleData) {
      return null;
    }

    return VehicleFactory.create({
      id: vehicleData.id,
      licensePlate: vehicleData.plate,
      brand: vehicleData.brand,
      model: vehicleData.model,
      year: vehicleData.year,
      customerId: vehicleData.customerId,
      createdAt: vehicleData.createdAt,
      updatedAt: vehicleData.updatedAt,
    });
  }

  async findByLicensePlate(licensePlate: LicensePlate): Promise<Vehicle | null> {
    const vehicleData = await this.uow.client.vehicle.findFirst({
      where: { 
        plate: licensePlate.value,
        deletedAt: null,
      },
    });

    if (!vehicleData) {
      return null;
    }

    return VehicleFactory.create({
      id: vehicleData.id,
      licensePlate: vehicleData.plate,
      brand: vehicleData.brand,
      model: vehicleData.model,
      year: vehicleData.year,
      customerId: vehicleData.customerId,
      createdAt: vehicleData.createdAt,
      updatedAt: vehicleData.updatedAt,
    });
  }

  async create(vehicle: Vehicle): Promise<void> {
    await this.uow.client.vehicle.create({
      data: {
        id: vehicle.id,
        plate: vehicle.licensePlate.value,
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year.value,
        customerId: vehicle.customerId,
        createdAt: vehicle.createdAt,
        updatedAt: vehicle.updatedAt,
      },
    });
  }

  async update(vehicle: Vehicle): Promise<void> {
  }

  async archive(vehicle: Vehicle): Promise<void> {
    if (!vehicle.deletedAt) {
      throw new Error('Vehicle must be soft deleted before calling repository delete method');
    }

    await this.uow.client.vehicle.update({
      where: {
        id: vehicle.id,
      },
      data: {
        deletedAt: vehicle.deletedAt,
      },
    });
  }

  async archiveAllByCustomerId(customerId: string): Promise<void> {
    await this.uow.client.vehicle.updateMany({
      where: {
        customerId: customerId,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
