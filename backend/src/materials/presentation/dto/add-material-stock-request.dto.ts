import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';
import AddMaterialStockInputDTO from '@materials/application/dtos/add-material-stock-input.dto';

export default class AddMaterialStockRequestDto implements Omit<
  AddMaterialStockInputDTO,
  'id'
> {
  @ApiProperty({ description: 'Quantity to add to stock', example: 5 })
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0.001)
  quantity!: number;
}
