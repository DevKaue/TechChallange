import Material from '@materials/domain/entities/material.entity';
import { MaterialType } from '@materials/domain/enums/material-type.enum';
import { StockUnit } from '@materials/domain/enums/stock-unit.enum';

export default class MaterialDTO {
  id!: string;
  name!: string;
  description!: string | null;
  price!: number;
  type!: MaterialType;
  stockQuantity!: number;
  stockUnit!: StockUnit;
  expiresAt!: Date | null;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(init?: Partial<MaterialDTO>) {
    Object.assign(this, init);
  }

  static fromDomain(material: Material): MaterialDTO {
    return new MaterialDTO({
      id: material.id,
      name: material.name,
      description: material.description,
      price: material.price,
      type: material.type,
      stockQuantity: material.stockQuantity,
      stockUnit: material.stockUnit,
      expiresAt: material.expiresAt,
      createdAt: material.createdAt,
      updatedAt: material.updatedAt,
    });
  }
}
