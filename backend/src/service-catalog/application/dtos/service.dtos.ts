import Service from '@service-catalog/domain/entities/service.entity';

export interface ServiceDTO {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  createdAt: Date;
  updatedAt: Date;
}

export function toServiceDTO(entity: Service): ServiceDTO {
  return {
    id: entity.id,
    name: entity.name,
    description: entity.description,
    price: entity.price,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  };
}

export interface CreateServiceInputDTO {
  name: string;
  description?: string;
  price: number;
}

export interface UpdateServiceInputDTO {
  name?: string;
  description?: string;
  price?: number;
}
