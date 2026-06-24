import Part from '@parts/domain/entities/part.entity';

export default class PartFactory {
  static create(props: {
    id?: string;
    name: string;
    description?: string | null;
    price: number;
    stockQuantity?: number;
    createdAt?: Date;
    updatedAt?: Date;
  }): Part {
    return new Part({
      id: props.id ?? crypto.randomUUID(),
      name: props.name,
      description: props.description,
      price: props.price,
      stockQuantity: props.stockQuantity,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    });
  }
}
