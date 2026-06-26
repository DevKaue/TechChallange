import Vehicle from '@customer-management/domain/entities/vehicle.entity';

export default class VehicleDTO {
  id!: string;
  licensePlate!: string;
  brand!: string;
  model!: string;
  year!: number;
  customerId!: string;
  createdAt!: Date;
  updatedAt?: Date;

  constructor(init?: Partial<VehicleDTO>) {
    Object.assign(this, init);
  }

  static fromDomain(entity: Vehicle): VehicleDTO {
    return new VehicleDTO({
      id: entity.id,
      licensePlate: entity.licensePlate.value,
      brand: entity.brand,
      model: entity.model,
      year: entity.year.value,
      customerId: entity.customerId,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}
