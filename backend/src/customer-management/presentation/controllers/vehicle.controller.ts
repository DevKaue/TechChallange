import { Controller, Post, Body, Param, Get, UseFilters, Delete } from '@nestjs/common';
import { ApiTags, ApiCreatedResponse, ApiBadRequestResponse, ApiBody, ApiConflictResponse, ApiOkResponse, ApiNotFoundResponse, ApiParam } from '@nestjs/swagger';
import { CreateVehicleUseCase } from '@customer-management/application/usecases/create-vehicle.usecase';
import FindVehicleByIdUseCase from '@customer-management/application/usecases/find-vehicle-by-id.usecase';
import DeleteVehicleUseCase from '@customer-management/application/usecases/delete-vehicle.usecase';
import CreateVehicleInputDTO from '@customer-management/application/dtos/create-vehicle-input.dto';
import FindVehicleByIdInputDTO from '@customer-management/application/dtos/find-vehicle-by-id-input.dto';
import DeleteVehicleInputDTO from '@customer-management/application/dtos/delete-vehicle-input.dto';
import { JsonVehiclePresenter, VehicleResponse } from '@customer-management/presentation/presenters/json-vehicle.presenter';
import { BodyCamelCase } from '@/common/decorators/body-camel-case.decorator';
import { CreateVehicleSwaggerBody, CreateVehicleSwaggerResponse, CreateVehicleSwaggerConflictResponse } from '@customer-management/presentation/swaggers/create-vehicle.swagger';
import { FindVehicleByIdSwaggerResponse } from '@customer-management/presentation/swaggers/find-vehicle-by-id.swagger';
import { VehicleNotFoundSwaggerResponse } from '@customer-management/presentation/swaggers/vehicle.swagger';
import { CustomerNotFoundSwaggerResponse } from '@/customer-management/presentation/swaggers/customer.swagger';
import { HttpErrorSwaggerResponse } from '@customer-management/presentation/swaggers/http-error.swagger';
import { VehicleExceptionFilter } from '@customer-management/presentation/filters/vehicle-exception.filter';
import { CustomerExceptionFilter } from '@customer-management/presentation/filters/customer-exception.filter';

@ApiTags('Vehicles')
@Controller()
@UseFilters(VehicleExceptionFilter)
@UseFilters(CustomerExceptionFilter)
export class VehicleController {
  constructor(
    private readonly createVehicleUseCase: CreateVehicleUseCase,
    private readonly findVehicleByIdUseCase: FindVehicleByIdUseCase,
    private readonly deleteVehicleUseCase: DeleteVehicleUseCase
  ) {}

  @Post('customers/:customerId/vehicles')
  @ApiBody({ type: CreateVehicleSwaggerBody })
  @ApiCreatedResponse({ 
    description: 'Veículo cadastrado com sucesso',
    type: CreateVehicleSwaggerResponse,
  })
  @ApiBadRequestResponse({ 
    description: 'Dados de entrada inválidos', 
    type: HttpErrorSwaggerResponse 
  })
  @ApiConflictResponse({ 
    description: 'Placa já cadastrada no sistema',
    type: CreateVehicleSwaggerConflictResponse 
  })
  @ApiNotFoundResponse({ 
    description: 'Cliente não encontrado', 
    type: CustomerNotFoundSwaggerResponse 
  })
  async create(
    @Param('customerId') customerId: string,
    @BodyCamelCase() input: CreateVehicleInputDTO
  ): Promise<VehicleResponse> {
    const output = await this.createVehicleUseCase.execute({ ...input, customerId });
    
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
    type: VehicleNotFoundSwaggerResponse 
  })
  async findById(@Param('id') id: string): Promise<VehicleResponse> {
    const input = new FindVehicleByIdInputDTO({ id }); 
    const output = await this.findVehicleByIdUseCase.execute(input);
    return JsonVehiclePresenter.present(output.vehicle);
  }

  @Delete('vehicles/:id')
  @ApiParam({ name: 'id', description: 'ID do veículo', type: String })
  @ApiOkResponse({ 
    description: 'Veículo excluído com sucesso'
  })
  @ApiNotFoundResponse({ 
    description: 'Veículo não encontrado', 
    type: VehicleNotFoundSwaggerResponse 
  })
  async delete(@Param('id') id: string): Promise<void> {
    const input = new DeleteVehicleInputDTO({ id });
    await this.deleteVehicleUseCase.execute(input);
  }
}