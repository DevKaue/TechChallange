import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';
import AddPartStockInputDTO from '@parts/application/dtos/add-part-stock-input.dto';

export default class AddPartStockRequestDto implements Omit<
  AddPartStockInputDTO,
  'id'
> {
  @ApiProperty({ description: 'Quantity to add to stock', example: 5 })
  @IsInt()
  @Min(1)
  quantity!: number;
}
