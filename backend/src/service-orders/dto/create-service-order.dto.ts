import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateServiceOrderDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  clientId: string;

  @IsString()
  @IsNotEmpty()
  @IsUUID()
  vehicleId: string;
}
