import {
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '@/access-identity/infra/guards/jwt-auth.guard';
import { RolesGuard } from '@/access-identity/infra/guards/roles.guard';
import { Roles } from '@/access-identity/infra/decorators/roles.decorator';
import { UserRole } from '@/access-identity/domain/enums/user-role.enum';
import { BodyCamelCase } from '@/common/decorators/body-camel-case.decorator';
import { adaptNestRoute } from '@/common/adapters/nest-route.adapter';
import ArchiveVehicleController from '@/customer-management/presentation/controllers/archive-vehicle.controller';
import CreateVehicleController from '@/customer-management/presentation/controllers/create-vehicle.controller';
import FindVehicleByIdController from '@/customer-management/presentation/controllers/find-vehicle-by-id.controller';
import ListVehiclesController from '@/customer-management/presentation/controllers/list-vehicles.controller';
import UpdateVehicleController from '@/customer-management/presentation/controllers/update-vehicle.controller';
import { DomainExceptionFilter } from '@/customer-management/infra/filters/domain-exception.filter';
import {
  VehicleApiControllerDocs,
  VehicleApiCreateDocs,
  VehicleApiDeleteDocs,
  VehicleApiFindByIdDocs,
  VehicleApiListDocs,
  VehicleApiUpdateDocs,
} from '@/customer-management/infra/swaggers/vehicle-routes.swagger';
import type { CreateVehicleInput } from '@/customer-management/application/usecases/create-vehicle.usecase';
import type { UpdateVehicleInput } from '@/customer-management/application/usecases/update-vehicle.usecase';
import type { VehicleResponse } from '@/customer-management/presentation/presenters/json-vehicle.presenter';

@VehicleApiControllerDocs()
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ATTENDANT)
@UseFilters(DomainExceptionFilter)
export class VehicleInfraController {
  constructor(
    private readonly createVehicleController: CreateVehicleController,
    private readonly findVehicleByIdController: FindVehicleByIdController,
    private readonly listVehiclesController: ListVehiclesController,
    private readonly updateVehicleController: UpdateVehicleController,
    private readonly archiveVehicleController: ArchiveVehicleController,
  ) {}

  @Get('vehicles')
  @VehicleApiListDocs()
  async list(
    @Query('customerId') customerId: string | undefined,
    @Res({ passthrough: true }) res: Response,
  ): Promise<VehicleResponse[]> {
    const httpResponse = await adaptNestRoute(this.listVehiclesController, {
      body: undefined,
      params: undefined,
      query: { customerId },
    });

    res.status(httpResponse.statusCode);

    return httpResponse.body;
  }

  @Post('customers/:customerId/vehicles')
  @VehicleApiCreateDocs()
  async create(
    @Param('customerId') customerId: string,
    @BodyCamelCase() input: Omit<CreateVehicleInput, 'customerId'>,
    @Res({ passthrough: true }) res: Response,
  ): Promise<VehicleResponse> {
    const httpResponse = await adaptNestRoute(this.createVehicleController, {
      body: input,
      params: { customerId },
      query: undefined,
    });

    res.status(httpResponse.statusCode);

    return httpResponse.body;
  }

  @Get('vehicles/:id')
  @VehicleApiFindByIdDocs()
  async findById(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<VehicleResponse> {
    const httpResponse = await adaptNestRoute(this.findVehicleByIdController, {
      body: undefined,
      params: { id },
      query: undefined,
    });

    res.status(httpResponse.statusCode);

    return httpResponse.body;
  }

  @Patch('vehicles/:id')
  @VehicleApiUpdateDocs()
  async update(
    @Param('id') id: string,
    @BodyCamelCase() input: Omit<UpdateVehicleInput, 'id'>,
    @Res({ passthrough: true }) res: Response,
  ): Promise<VehicleResponse> {
    const httpResponse = await adaptNestRoute(this.updateVehicleController, {
      body: input,
      params: { id },
      query: undefined,
    });

    res.status(httpResponse.statusCode);

    return httpResponse.body;
  }

  @Delete('vehicles/:id')
  @VehicleApiDeleteDocs()
  async delete(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const httpResponse = await adaptNestRoute(this.archiveVehicleController, {
      body: undefined,
      params: { id },
      query: undefined,
    });

    res.status(httpResponse.statusCode);
    return httpResponse.body;
  }
}
