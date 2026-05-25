import { IsInt, IsNotEmpty, IsString } from 'class-validator';
import { IsValidPlate } from '../../common/validators/plate.validator';

export class CreateVehicleDto {
  @IsNotEmpty()
  @IsString()
  @IsValidPlate()
  plate: string;

  @IsNotEmpty()
  @IsString()
  brand: string;

  @IsNotEmpty()
  @IsString()
  model: string;

  @IsNotEmpty()
  @IsInt()
  year: number;

  @IsNotEmpty()
  @IsString()
  clientId: string;
}
