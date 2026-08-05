import {
  Controller,
  Post,
  Param,
  Get,
  Patch,
  Query,
  UseFilters,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiNoContentResponse,
  ApiBody,
  ApiConflictResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/access-identity/presentation/guards/jwt-auth.guard';
import { RolesGuard } from '@/access-identity/presentation/guards/roles.guard';
import { Roles } from '@/access-identity/presentation/decorators/roles.decorator';
import { UserRole } from '@/access-identity/domain/enums/user-role.enum';
import {
  CreateVehicleUseCase,
  type CreateVehicleInput,
} from '@customer-management/application/usecases/create-vehicle.usecase';
import FindVehicleByIdUseCase from '@customer-management/application/usecases/find-vehicle-by-id.usecase';
import ListVehicleUseCase from '@/customer-management/application/usecases/list-vehicle.usecase';
import UpdateVehicleUseCase, {
  type UpdateVehicleInput,
} from '@customer-management/application/usecases/update-vehicle.usecase';
import ArchiveVehicleUseCase from '@/customer-management/application/usecases/archive-vehicle.usecase';
import {
  JsonVehiclePresenter,
  VehicleResponse,
} from '@customer-management/presentation/presenters/json-vehicle.presenter';
import { BodyCamelCase } from '@/common/decorators/body-camel-case.decorator';
import {
  CreateVehicleSwaggerBody,
  CreateVehicleSwaggerResponse,
  CreateVehicleSwaggerConflictResponse,
} from '@customer-management/presentation/swaggers/create-vehicle.swagger';
import {
  UpdateVehicleSwaggerBody,
  UpdateVehicleSwaggerResponse,
  UpdateVehicleSwaggerConflictResponse,
} from '@customer-management/presentation/swaggers/update-vehicle.swagger';
import { FindVehicleByIdSwaggerResponse } from '@customer-management/presentation/swaggers/find-vehicle-by-id.swagger';
import { VehicleNotFoundSwaggerResponse } from '@customer-management/presentation/swaggers/vehicle.swagger';
import { CustomerNotFoundSwaggerResponse } from '@/customer-management/presentation/swaggers/customer.swagger';
import { HttpErrorSwaggerResponse } from '@customer-management/presentation/swaggers/http-error.swagger';
import { VehicleExceptionFilter } from '@customer-management/presentation/filters/vehicle-exception.filter';
import { CustomerExceptionFilter } from '@customer-management/presentation/filters/customer-exception.filter';

@ApiTags('Vehicles')
@ApiBearerAuth()
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ATTENDANT)
@UseFilters(VehicleExceptionFilter)
@UseFilters(CustomerExceptionFilter)
export class VehicleController {
  constructor(
    private readonly createVehicleUseCase: CreateVehicleUseCase,
    private readonly findVehicleByIdUseCase: FindVehicleByIdUseCase,
    private readonly listVehiclesUseCase: ListVehicleUseCase,
    private readonly updateVehicleUseCase: UpdateVehicleUseCase,
    private readonly archiveVehicleUseCase: ArchiveVehicleUseCase,
  ) {}

  @Get('vehicles')
  @ApiQuery({ name: 'customerId', required: false, type: String })
  @ApiOkResponse({ description: 'Lista de veículos' })
  async list(
    @Query('customerId') customerId?: string,
  ): Promise<VehicleResponse[]> {
    const input = {
      customerId: customerId ?? undefined,
    };
    const output = await this.listVehiclesUseCase.execute(input);
    return JsonVehiclePresenter.presentMany(output.vehicles);
  }

  @Post('customers/:customerId/vehicles')
  @ApiBody({ type: CreateVehicleSwaggerBody })
  @ApiCreatedResponse({
    description: 'Veículo cadastrado com sucesso',
    type: CreateVehicleSwaggerResponse,
  })
  @ApiBadRequestResponse({
    description: 'Dados de entrada inválidos',
    type: HttpErrorSwaggerResponse,
  })
  @ApiConflictResponse({
    description: 'Placa já cadastrada no sistema',
    type: CreateVehicleSwaggerConflictResponse,
  })
  @ApiNotFoundResponse({
    description: 'Cliente não encontrado',
    type: CustomerNotFoundSwaggerResponse,
  })
  async create(
    @Param('customerId') customerId: string,
    @BodyCamelCase() input: Omit<CreateVehicleInput, 'customerId'>,
  ): Promise<VehicleResponse> {
    const output = await this.createVehicleUseCase.execute({
      ...input,
      customerId,
    });

    return JsonVehiclePresenter.present(output.vehicle);
  }

  @Get('vehicles/:id')
  @ApiParam({ name: 'id', description: 'ID do veículo', type: String })
  @ApiOkResponse({
    description: 'Veículo encontrado com sucesso',
    type: FindVehicleByIdSwaggerResponse,
  })
  @ApiNotFoundResponse({
    description: 'Veículo não encontrado',
    type: VehicleNotFoundSwaggerResponse,
  })
  async findById(@Param('id') id: string): Promise<VehicleResponse> {
    const output = await this.findVehicleByIdUseCase.execute({ id });
    return JsonVehiclePresenter.present(output.vehicle);
  }

  @Patch('vehicles/:id')
  @ApiBody({ type: UpdateVehicleSwaggerBody })
  @ApiParam({ name: 'id', description: 'ID do veículo', type: String })
  @ApiOkResponse({
    description: 'Veículo atualizado com sucesso',
    type: UpdateVehicleSwaggerResponse,
  })
  @ApiBadRequestResponse({
    description: 'Dados de entrada inválidos',
    type: HttpErrorSwaggerResponse,
  })
  @ApiConflictResponse({
    description: 'Placa já cadastrada no sistema',
    type: UpdateVehicleSwaggerConflictResponse,
  })
  @ApiNotFoundResponse({
    description: 'Veículo não encontrado',
    type: VehicleNotFoundSwaggerResponse,
  })
  async update(
    @Param('id') id: string,
    @BodyCamelCase() input: Omit<UpdateVehicleInput, 'id'>,
  ): Promise<VehicleResponse> {
    const output = await this.updateVehicleUseCase.execute({ ...input, id });
    return JsonVehiclePresenter.present(output.vehicle);
  }

  @Delete('vehicles/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'id', description: 'ID do veículo', type: String })
  @ApiNoContentResponse({
    description: 'Veículo excluído com sucesso',
  })
  @ApiNotFoundResponse({
    description: 'Veículo não encontrado',
    type: VehicleNotFoundSwaggerResponse,
  })
  async delete(@Param('id') id: string): Promise<void> {
    await this.archiveVehicleUseCase.execute({ id });
  }
}
