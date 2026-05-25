import { IsInt, IsNotEmpty, IsString, IsUUID, Min } from 'class-validator';

export class AddItemToOrderDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  itemId: string;

  @IsInt()
  @Min(1)
  quantity: number = 1;
}
