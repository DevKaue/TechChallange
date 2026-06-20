import { Controller, Post, Body, UseFilters } from '@nestjs/common';
import { ApiTags, ApiCreatedResponse, ApiBadRequestResponse, ApiBody, ApiConflictResponse } from '@nestjs/swagger';
import { CreateCustomerUseCase } from '@customer-management/application/usecases/create-customer.usecase';
import CreateCustomerInputDTO from '@customer-management/application/dtos/create-customer-input.dto';
import { JsonCustomerPresenter, CustomerResponse } from '@customer-management/presentation/presenters/json-customer.presenter';
import { BodyCamelCase } from '@/common/decorators/body-camel-case.decorator';
import { CreateCustomerSwaggerBody, CreateCustomerSwaggerResponse, CreateCustomerSwaggerConflictResponse } from '@customer-management/presentation/swaggers/create-customer.swagger';
import { HttpErrorSwaggerResponse } from '@customer-management/presentation/swaggers/http-error.swagger';
import { CustomerExceptionFilter } from '@customer-management/presentation/filters/customer-exception.filter';

@ApiTags('Customers')
@Controller('customers')
@UseFilters(CustomerExceptionFilter)
export class CustomerController {
  constructor(private readonly createCustomerUseCase: CreateCustomerUseCase) {}

  @Post()
  @ApiBody({ type: CreateCustomerSwaggerBody })
  @ApiCreatedResponse({ 
    description: 'Cliente cadastrado com sucesso',
    type: CreateCustomerSwaggerResponse,
  })
  @ApiBadRequestResponse({ 
    description: 'Dados de entrada inválidos', 
    type: HttpErrorSwaggerResponse 
  })
  @ApiConflictResponse({ 
    description: 'Documento já cadastrado no sistema',
    type: CreateCustomerSwaggerConflictResponse 
  })
  async create(@BodyCamelCase() input: CreateCustomerInputDTO): Promise<{ status: string; data: CustomerResponse }> {
    const output = await this.createCustomerUseCase.execute(input);
    
    return {
      status: 'success',
      data: JsonCustomerPresenter.present(output.customer),
    };
  }
}
