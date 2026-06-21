import { ApiProperty } from '@nestjs/swagger';
import { CustomerResponseData } from '@customer-management/presentation/swaggers/customer.swagger';

export class FindCustomerByIdSwaggerResponse extends CustomerResponseData {}