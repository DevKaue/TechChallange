import Part from '@parts/domain/entities/part.entity';

export default abstract class PartRepositoryInterface {
  abstract create(part: Part): Promise<void>;

  abstract findAll(): Promise<Part[]>;

  abstract findById(id: string): Promise<Part | null>;

  abstract update(part: Part): Promise<void>;

  abstract delete(id: string): Promise<void>;

  abstract decrementStock(partId: string, quantity: number): Promise<void>;
}
