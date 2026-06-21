import { ApiProperty } from '@nestjs/swagger';

class VehicleResponseData {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'ID do veículo' })
  id!: string;

  @ApiProperty({ example: 'ABC1234', description: 'Placa do veículo' })
  license_plate!: string;

  @ApiProperty({ example: 'Toyota' })
  brand!: string;

  @ApiProperty({ example: 'Corolla' })
  model!: string;

  @ApiProperty({ example: 2023 })
  year!: number;

  @ApiProperty({ example: '2026-06-21T15:00:00.000Z' })
  created_at!: string;

  @ApiProperty({ example: '2026-06-21T15:00:00.000Z' })
  updated_at!: string;
}

export class CreateVehicleSwaggerResponse extends VehicleResponseData {}

export class CreateVehicleSwaggerBody {
  @ApiProperty({ example: 'ABC1234', description: 'Placa do veículo no formato brasileiro' })
  license_plate!: string;

  @ApiProperty({ example: 'Toyota', description: 'Marca do veículo' })
  brand!: string;

  @ApiProperty({ example: 'Corolla', description: 'Modelo do veículo' })
  model!: string;

  @ApiProperty({ example: 2023, description: 'Ano de fabricação do veículo' })
  year!: number;
}

export class CreateVehicleSwaggerConflictResponse {
  @ApiProperty({ example: 409 })
  status_code!: number;

  @ApiProperty({ example: 'Conflict' })
  error!: string;

  @ApiProperty({ example: 'Vehicle with this license plate already exists' })
  message!: string;
}
