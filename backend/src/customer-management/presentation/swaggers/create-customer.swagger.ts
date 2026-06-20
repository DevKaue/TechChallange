import { ApiProperty } from '@nestjs/swagger';

class CustomerResponseData {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'ID do cliente' })
  id!: string;

  @ApiProperty({ example: 'CPF' })
  document_type!: string;

  @ApiProperty({ example: '10738082031' })
  document_number!: string;

  @ApiProperty({ example: 'João Silva' })
  name!: string;

  @ApiProperty({ example: '11999999999' })
  phone!: string;

  @ApiProperty({ example: 'joao@email.com' })
  email!: string;
  
  @ApiProperty({ example: '2026-03-21T15:00:00.000Z' })
  created_at!: string;
}

export class CreateCustomerSwaggerResponse {
  @ApiProperty({ type: CustomerResponseData })
  customer!: CustomerResponseData;
}

export class CreateCustomerSwaggerBody {
  @ApiProperty({ example: 'CPF', description: 'Tipo de documento do cliente' })
  document_type!: string;

  @ApiProperty({ example: '10738082031' })
  document_number!: string;

  @ApiProperty({ example: 'João Silva' })
  name!: string;

  @ApiProperty({ example: '11999999999' })
  phone!: string;

  @ApiProperty({ example: 'joao@email.com' })
  email!: string;
}

export class CreateCustomerSwaggerConflictResponse {
  @ApiProperty({ example: 409 })
  statusCode!: number;

  @ApiProperty({ example: 'Conflict' })
  error!: string;

  @ApiProperty({ example: 'Customer with the same document already exists' })
  message!: string;
}