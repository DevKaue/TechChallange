import { ApiProperty } from '@nestjs/swagger';
import { CustomerResponseData } from '@customer-management/presentation/swaggers/customer.swagger';

export class CreateCustomerSwaggerResponse extends CustomerResponseData {}

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
  status_code!: number;

  @ApiProperty({ example: 'Conflict' })
  error!: string;

  @ApiProperty({ example: 'Customer with the same document already exists' })
  message!: string;
}