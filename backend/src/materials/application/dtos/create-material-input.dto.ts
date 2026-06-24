import { MaterialType } from '@materials/domain/enums/material-type.enum';
import { StockUnit } from '@materials/domain/enums/stock-unit.enum';

export default class CreateMaterialInputDTO {
  name!: string;
  description?: string | null;
  price!: number;
  type?: MaterialType;
  stockQuantity?: number;
  stockUnit?: StockUnit;
  expiresAt?: Date | string | null;
}
