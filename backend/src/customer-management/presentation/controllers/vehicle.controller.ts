import { Controller, Post, Body, Param, UseFilters } from '@nestjs/common';
import { ApiTags, ApiCreatedResponse, ApiBadRequestResponse, ApiBody, ApiConflictResponse } from '@nestjs/swagger';
import { CreateVehicleUseCase } from '@customer-management/application/usecases/create-vehicle.usecase';
import CreateVehicleInputDTO from '@customer-management/application/dtos/create-vehicle-input.dto';
import { JsonVehiclePresenter, VehicleResponse } from '@customer-management/presentation/presenters/json-vehicle.presenter';
import { BodyCamelCase } from '@/common/decorators/body-camel-case.decorator';
import { CreateVehicleSwaggerBody, CreateVehicleSwaggerResponse, CreateVehicleSwaggerConflictResponse } from '@customer-management/presentation/swaggers/create-vehicle.swagger';
import { HttpErrorSwaggerResponse } from '@customer-management/presentation/swaggers/http-error.swagger';
import { VehicleExceptionFilter } from '@customer-management/presentation/filters/vehicle-exception.filter';

@ApiTags('Vehicles')
@Controller('customers/:customerId/vehicles')
@UseFilters(VehicleExceptionFilter)
export class VehicleController {
  constructor(private readonly createVehicleUseCase: CreateVehicleUseCase) {}

  @Post()
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
  async create(
    @Param('customerId') customerId: string,
    @BodyCamelCase() input: CreateVehicleInputDTO
  ): Promise<VehicleResponse> {
    const output = await this.createVehicleUseCase.execute({ ...input, customerId });
    
    return JsonVehiclePresenter.present(output.vehicle);
  }
}
