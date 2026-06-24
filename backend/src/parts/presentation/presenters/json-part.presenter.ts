import PartDTO from '@parts/application/dtos/part.dto';

export type PartResponse = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stockQuantity: number;
  createdAt: Date;
  updatedAt: Date;
};

export class JsonPartPresenter {
  static present(part: PartDTO): PartResponse {
    return {
      id: part.id,
      name: part.name,
      description: part.description,
      price: part.price,
      stockQuantity: part.stockQuantity,
      createdAt: part.createdAt,
      updatedAt: part.updatedAt,
    };
  }
}
