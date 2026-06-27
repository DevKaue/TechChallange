import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export default class CreateVehicleInputDTO {
  @IsString()
  @IsNotEmpty()
  licensePlate!: string;

  @IsString()
  @IsNotEmpty()
  brand!: string;

  @IsString()
  @IsNotEmpty()
  model!: string;

  @IsNumber()
  year!: number;

  @IsOptional()
  @IsString()
  customerId?: string;
}
