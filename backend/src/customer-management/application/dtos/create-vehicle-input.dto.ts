import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

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

  @IsString()
  @IsNotEmpty()
  customerId!: string;

  constructor(props?: Partial<CreateVehicleInputDTO>) {
    Object.assign(this, props);
  }
}
