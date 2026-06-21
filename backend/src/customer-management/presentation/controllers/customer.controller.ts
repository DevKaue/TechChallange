import { Controller, Get, Param, Post, UseFilters } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import CreateCustomerInputDTO from '@customer-management/application/dtos/create-customer-input.dto';
import FindCustomerByIdInputDTO from '@/customer-management/application/dtos/find-customer-by-id-input.dto';
import CreateCustomerUseCase from '@customer-management/application/usecases/create-customer.usecase';
import FindCustomerByIdUseCase from '@/customer-management/application/usecases/find-customer-by-id.usecase';

import { CustomerExceptionFilter } from '@customer-management/presentation/filters/customer-exception.filter';
import { CustomerResponse, JsonCustomerPresenter } from '@customer-management/presentation/presenters/json-customer.presenter';

import { CreateCustomerSwaggerBody, CreateCustomerSwaggerConflictResponse, CreateCustomerSwaggerResponse } from '@customer-management/presentation/swaggers/create-customer.swagger';
import { CustomerNotFoundSwaggerResponse } from '@/customer-management/presentation/swaggers/customer.swagger';
import { FindCustomerByIdSwaggerResponse } from '@/customer-management/presentation/swaggers/find-customer-by-id.swagger';
import { HttpErrorSwaggerResponse } from '@customer-management/presentation/swaggers/http-error.swagger';

import { BodyCamelCase } from '@/common/decorators/body-camel-case.decorator';

@ApiTags('Customers')
@Controller('customers')
@UseFilters(CustomerExceptionFilter)
export class CustomerController {
  constructor(
    private readonly createCustomerUseCase: CreateCustomerUseCase,
    private readonly findCustomerByIdUseCase: FindCustomerByIdUseCase
  ) {}

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
  async create(@BodyCamelCase() input: CreateCustomerInputDTO): Promise<CustomerResponse> {
    const output = await this.createCustomerUseCase.execute(input);
    
    return JsonCustomerPresenter.present(output.customer);
  }

  @Get(':id')
  @ApiParam({ name: 'id', description: 'ID do cliente', type: String })
  @ApiOkResponse({ 
    description: 'Cliente encontrado com sucesso',
    type: FindCustomerByIdSwaggerResponse, 
  })
  @ApiNotFoundResponse({ 
    description: 'Cliente não encontrado', 
    type: CustomerNotFoundSwaggerResponse 
  })
  async findById(@Param('id') id: string): Promise<CustomerResponse> {
    const input = new FindCustomerByIdInputDTO({ id }); 
    const output = await this.findCustomerByIdUseCase.execute(input);
    return JsonCustomerPresenter.present(output.customer);
  }
}
