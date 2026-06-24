import Part from '@parts/domain/entities/part.entity';

export default class PartDTO {
  id!: string;
  name!: string;
  description!: string | null;
  price!: number;
  stockQuantity!: number;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(init?: Partial<PartDTO>) {
    Object.assign(this, init);
  }

  static fromDomain(part: Part): PartDTO {
    return new PartDTO({
      id: part.id,
      name: part.name,
      description: part.description,
      price: part.price,
      stockQuantity: part.stockQuantity,
      createdAt: part.createdAt,
      updatedAt: part.updatedAt,
    });
  }
}
