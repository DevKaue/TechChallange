import Service from '@service-catalog/domain/entities/service.entity';

export class ServiceDTO {
  id!: string;
  name!: string;
  description?: string | null;
  price!: number;
  createdAt!: Date;
  updatedAt!: Date;

  static fromDomain(entity: Service): ServiceDTO {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      price: entity.price,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}

export class CreateServiceInputDTO {
  name!: string;
  description?: string;
  price!: number;
}

export class UpdateServiceInputDTO {
  name?: string;
  description?: string;
  price?: number;
}
