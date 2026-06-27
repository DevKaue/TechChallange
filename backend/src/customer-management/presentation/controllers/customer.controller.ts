import {
  Controller,
  Get,
  Param,
  Post,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/access-identity/presentation/guards/jwt-auth.guard';
import { RolesGuard } from '@/access-identity/presentation/guards/roles.guard';
import { Roles } from '@/access-identity/presentation/decorators/roles.decorator';
import { UserRole } from '@/access-identity/domain/enums/user-role.enum';

import CreateCustomerInputDTO from '@customer-management/application/dtos/create-customer-input.dto';
import FindCustomerByIdInputDTO from '@/customer-management/application/dtos/find-customer-by-id-input.dto';
import UpdateCustomerInputDTO from '@customer-management/application/dtos/update-customer-input.dto';
import ArchiveCustomerInputDTO from '@/customer-management/application/dtos/archive-customer-input.dto';
import CreateCustomerUseCase from '@customer-management/application/usecases/create-customer.usecase';
import FindCustomerByIdUseCase from '@/customer-management/application/usecases/find-customer-by-id.usecase';
import ListCustomersUseCase from '@customer-management/application/usecases/list-customers.usecase';
import UpdateCustomerUseCase from '@customer-management/application/usecases/update-customer.usecase';
import ArchiveCustomerUseCase from '@/customer-management/application/usecases/archive-customer.usecase';

import { CustomerExceptionFilter } from '@customer-management/presentation/filters/customer-exception.filter';
import {
  CustomerResponse,
  JsonCustomerPresenter,
} from '@customer-management/presentation/presenters/json-customer.presenter';

import {
  CreateCustomerSwaggerBody,
  CreateCustomerSwaggerConflictResponse,
  CreateCustomerSwaggerResponse,
} from '@customer-management/presentation/swaggers/create-customer.swagger';
import { CustomerNotFoundSwaggerResponse } from '@/customer-management/presentation/swaggers/customer.swagger';
import { FindCustomerByIdSwaggerResponse } from '@/customer-management/presentation/swaggers/find-customer-by-id.swagger';
import { HttpErrorSwaggerResponse } from '@customer-management/presentation/swaggers/http-error.swagger';

import { BodyCamelCase } from '@/common/decorators/body-camel-case.decorator';
import { UpdateCustomerSwaggerBody, UpdateCustomerSwaggerResponse } from '../swaggers/update-customer.swagger';

@ApiTags('Customers')
@ApiBearerAuth()
@Controller('customers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ATTENDANT)
@UseFilters(CustomerExceptionFilter)
export class CustomerController {
  constructor(
    private readonly createCustomerUseCase: CreateCustomerUseCase,
    private readonly findCustomerByIdUseCase: FindCustomerByIdUseCase,
    private readonly listCustomersUseCase: ListCustomersUseCase,
    private readonly updateCustomerUseCase: UpdateCustomerUseCase,
    private readonly archiveCustomerUseCase: ArchiveCustomerUseCase,
  ) {}

  @Get()
  @ApiOkResponse({ description: 'Lista de clientes' })
  async list(): Promise<CustomerResponse[]> {
    const customers = await this.listCustomersUseCase.execute();
    return JsonCustomerPresenter.presentMany(customers);
  }

  @Post()
  @ApiBody({ type: CreateCustomerSwaggerBody })
  @ApiCreatedResponse({
    description: 'Cliente cadastrado com sucesso',
    type: CreateCustomerSwaggerResponse,
  })
  @ApiBadRequestResponse({
    description: 'Dados de entrada inválidos',
    type: HttpErrorSwaggerResponse,
  })
  @ApiConflictResponse({
    description: 'Documento já cadastrado no sistema',
    type: CreateCustomerSwaggerConflictResponse,
  })
  async create(
    @BodyCamelCase() input: CreateCustomerInputDTO,
  ): Promise<CustomerResponse> {
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
    type: CustomerNotFoundSwaggerResponse,
  })
  async findById(@Param('id') id: string): Promise<CustomerResponse> {
    const input = new FindCustomerByIdInputDTO({ id });
    const output = await this.findCustomerByIdUseCase.execute(input);
    return JsonCustomerPresenter.present(output.customer);
  }

  @Patch(':id')
  @ApiParam({ name: 'id', description: 'ID do cliente', type: String })
  @ApiBody({ type: UpdateCustomerSwaggerBody })
  @ApiOkResponse({ description: 'Cliente atualizado com sucesso', type: UpdateCustomerSwaggerResponse })
  @ApiBadRequestResponse({
    description: 'Dados de entrada inválidos',
    type: HttpErrorSwaggerResponse,
  })
  @ApiNotFoundResponse({
    description: 'Cliente não encontrado',
    type: CustomerNotFoundSwaggerResponse,
  })
  async update(
    @Param('id') id: string,
    @BodyCamelCase() input: UpdateCustomerInputDTO,
  ): Promise<CustomerResponse> {
    const customer = await this.updateCustomerUseCase.execute(
      new UpdateCustomerInputDTO({ ...input, id }),
    );
    return JsonCustomerPresenter.present(customer);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'id', description: 'ID do cliente', type: String })
  @ApiNoContentResponse({ description: 'Cliente excluído com sucesso' })
  @ApiNotFoundResponse({
    description: 'Cliente não encontrado',
    type: CustomerNotFoundSwaggerResponse,
  })
  async delete(@Param('id') id: string): Promise<void> {
    const input = new ArchiveCustomerInputDTO({ id });
    await this.archiveCustomerUseCase.execute(input);
  }
}
