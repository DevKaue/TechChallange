import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export default class UpdateVehicleInputDTO {
  @IsString()
  @IsNotEmpty()
  id!: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsNumber()
  year?: number;

  @IsOptional()
  @IsString()
  licensePlate?: string;

  constructor(props?: Partial<UpdateVehicleInputDTO>) {
    Object.assign(this, props);
  }
}
