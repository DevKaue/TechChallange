import {
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '@/access-identity/infra/guards/jwt-auth.guard';
import { RolesGuard } from '@/access-identity/infra/guards/roles.guard';
import { Roles } from '@/access-identity/infra/decorators/roles.decorator';
import { UserRole } from '@/access-identity/domain/enums/user-role.enum';
import { BodyCamelCase } from '@/common/infra/decorators/body-camel-case.decorator';
import { adaptNestRoute } from '@/common/presentation/adapters/nest-route.adapter';
import ArchiveCustomerController from '@/customer-management/presentation/controllers/archive-customer.controller';
import CreateCustomerController from '@/customer-management/presentation/controllers/create-customer.controller';
import FindCustomerByIdController from '@/customer-management/presentation/controllers/find-customer-by-id.controller';
import ListCustomersController from '@/customer-management/presentation/controllers/list-customers.controller';
import UpdateCustomerController from '@/customer-management/presentation/controllers/update-customer.controller';
import {
  CustomerApiControllerDocs,
  CustomerApiCreateDocs,
  CustomerApiDeleteDocs,
  CustomerApiFindByIdDocs,
  CustomerApiListDocs,
  CustomerApiUpdateDocs,
} from '@/customer-management/infra/swaggers/customer-routes.swagger';
import { DomainExceptionFilter } from '@/customer-management/infra/filters/domain-exception.filter';
import type { CreateCustomerInput } from '@/customer-management/application/usecases/create-customer.usecase';
import type { UpdateCustomerInput } from '@/customer-management/application/usecases/update-customer.usecase';
import type { CustomerResponse } from '@/customer-management/presentation/presenters/json-customer.presenter';

@CustomerApiControllerDocs()
@Controller('customers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ATTENDANT)
@UseFilters(DomainExceptionFilter)
export class CustomerInfraController {
  constructor(
    private readonly createCustomerController: CreateCustomerController,
    private readonly findCustomerByIdController: FindCustomerByIdController,
    private readonly listCustomersController: ListCustomersController,
    private readonly updateCustomerController: UpdateCustomerController,
    private readonly archiveCustomerController: ArchiveCustomerController,
  ) {}

  @Get()
  @CustomerApiListDocs()
  async list(@Res({ passthrough: true }) res: Response): Promise<CustomerResponse[]> {
    const httpResponse = await adaptNestRoute(this.listCustomersController, {
      body: undefined,
      params: undefined,
      query: undefined,
    });

    res.status(httpResponse.statusCode);

    return httpResponse.body;
  }

  @Post()
  @CustomerApiCreateDocs()
  async create(
    @BodyCamelCase() input: CreateCustomerInput,
    @Res({ passthrough: true }) res: Response,
  ): Promise<CustomerResponse> {
    const httpResponse = await adaptNestRoute(this.createCustomerController, {
      body: input,
      params: undefined,
      query: undefined,
    });

    res.status(httpResponse.statusCode);

    return httpResponse.body;
  }

  @Get(':id')
  @CustomerApiFindByIdDocs()
  async findById(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<CustomerResponse> {
    const httpResponse = await adaptNestRoute(this.findCustomerByIdController, {
      body: undefined,
      params: { id },
      query: undefined,
    });

    res.status(httpResponse.statusCode);

    return httpResponse.body;
  }

  @Patch(':id')
  @CustomerApiUpdateDocs()
  async update(
    @Param('id') id: string,
    @BodyCamelCase() input: Omit<UpdateCustomerInput, 'id'>,
    @Res({ passthrough: true }) res: Response,
  ): Promise<CustomerResponse> {
    const httpResponse = await adaptNestRoute(this.updateCustomerController, {
      body: input,
      params: { id },
      query: undefined,
    });

    res.status(httpResponse.statusCode);

    return httpResponse.body;
  }

  @Delete(':id')
  @CustomerApiDeleteDocs()
  async delete(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const httpResponse = await adaptNestRoute(this.archiveCustomerController, {
      body: undefined,
      params: { id },
      query: undefined,
    });

    res.status(httpResponse.statusCode);
    return httpResponse.body;
  }
}
