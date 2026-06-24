import DomainException from '@parts/domain/exceptions/domain.exception';
import InsufficientPartStockException from '@parts/domain/exceptions/insufficient-part-stock.exception';

export type PartProps = {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  stockQuantity?: number;
  createdAt?: Date;
  updatedAt?: Date;
};

export type UpdatePartProps = Partial<
  Pick<PartProps, 'name' | 'description' | 'price' | 'stockQuantity'>
>;

export default class Part {
  private _id: string;
  private _name: string;
  private _description: string | null;
  private _price: number;
  private _stockQuantity: number;
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: PartProps) {
    this._id = props.id;
    this._name = this.validateName(props.name);
    this._description = this.normalizeDescription(props.description);
    this._price = this.validatePrice(props.price);
    this._stockQuantity = this.validateStockQuantity(props.stockQuantity ?? 0);
    this._createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();
  }

  public get id(): string {
    return this._id;
  }

  public get name(): string {
    return this._name;
  }

  public get description(): string | null {
    return this._description;
  }

  public get price(): number {
    return this._price;
  }

  public get stockQuantity(): number {
    return this._stockQuantity;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }

  public update(props: UpdatePartProps): void {
    if (props.name !== undefined) {
      this._name = this.validateName(props.name);
    }

    if (props.description !== undefined) {
      this._description = this.normalizeDescription(props.description);
    }

    if (props.price !== undefined) {
      this._price = this.validatePrice(props.price);
    }

    if (props.stockQuantity !== undefined) {
      this._stockQuantity = this.validateStockQuantity(props.stockQuantity);
    }

    this.touch();
  }

  public addStock(quantity: number): void {
    this.validateMovementQuantity(quantity);
    this._stockQuantity += quantity;
    this.touch();
  }

  public decrementStock(quantity: number): void {
    this.validateMovementQuantity(quantity);

    if (this._stockQuantity < quantity) {
      throw new InsufficientPartStockException(this._name, this._stockQuantity);
    }

    this._stockQuantity -= quantity;
    this.touch();
  }

  private touch(): void {
    this._updatedAt = new Date();
  }

  private validateName(name: string): string {
    const normalizedName = name?.trim();

    if (!normalizedName) {
      throw new DomainException('Part name is required.');
    }

    return normalizedName;
  }

  private normalizeDescription(description?: string | null): string | null {
    if (description === undefined || description === null) {
      return null;
    }

    const normalizedDescription = description.trim();
    return normalizedDescription.length > 0 ? normalizedDescription : null;
  }

  private validatePrice(price: number): number {
    if (!Number.isFinite(price) || price < 0) {
      throw new DomainException(
        'Part price must be greater than or equal to 0.',
      );
    }

    return price;
  }

  private validateStockQuantity(stockQuantity: number): number {
    if (!Number.isInteger(stockQuantity) || stockQuantity < 0) {
      throw new DomainException(
        'Part stock quantity must be an integer greater than or equal to 0.',
      );
    }

    return stockQuantity;
  }

  private validateMovementQuantity(quantity: number): void {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new DomainException(
        'Stock movement quantity must be a positive integer.',
      );
    }
  }
}
