import {
  Body,
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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { JwtAuthGuard } from '@/access-identity/infra/guards/jwt-auth.guard';
import { RolesGuard } from '@/access-identity/infra/guards/roles.guard';
import { Roles } from '@/access-identity/infra/decorators/roles.decorator';
import { UserRole } from '@/access-identity/domain/enums/user-role.enum';
import { adaptNestRoute } from '@/common/presentation/adapters/nest-route.adapter';
import { DomainExceptionFilter } from '@/common/infra/filters/domain-exception.filter';
import type { ServiceDTO } from '@service-catalog/application/dtos/service.dtos';
import { CreateServiceRequestDto } from '@service-catalog/presentation/dto/create-service-request.dto';
import { UpdateServiceRequestDto } from '@service-catalog/presentation/dto/update-service-request.dto';
import CreateServiceCatalogController from '@service-catalog/presentation/controllers/create-service-catalog.controller';
import DeleteServiceCatalogController from '@service-catalog/presentation/controllers/delete-service-catalog.controller';
import FindServiceCatalogByIdController from '@service-catalog/presentation/controllers/find-service-catalog-by-id.controller';
import ListServiceCatalogController from '@service-catalog/presentation/controllers/list-service-catalog.controller';
import UpdateServiceCatalogController from '@service-catalog/presentation/controllers/update-service-catalog.controller';

@ApiTags('Service Catalog')
@ApiBearerAuth()
@Controller('services')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ATTENDANT)
@UseFilters(DomainExceptionFilter)
export class ServiceCatalogInfraController {
  constructor(
    private readonly createServiceCatalogController: CreateServiceCatalogController,
    private readonly deleteServiceCatalogController: DeleteServiceCatalogController,
    private readonly findServiceCatalogByIdController: FindServiceCatalogByIdController,
    private readonly listServiceCatalogController: ListServiceCatalogController,
    private readonly updateServiceCatalogController: UpdateServiceCatalogController,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Cadastra um servico no catalogo' })
  async create(
    @Body() dto: CreateServiceRequestDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ServiceDTO> {
    const httpResponse = await adaptNestRoute(this.createServiceCatalogController, {
      body: dto,
      params: undefined,
      query: undefined,
    });

    res.status(httpResponse.statusCode);
    return httpResponse.body;
  }

  @Get()
  @ApiOperation({ summary: 'Lista os servicos do catalogo' })
  async list(@Res({ passthrough: true }) res: Response): Promise<ServiceDTO[]> {
    const httpResponse = await adaptNestRoute(this.listServiceCatalogController, {
      body: undefined,
      params: undefined,
      query: undefined,
    });

    res.status(httpResponse.statusCode);
    return httpResponse.body;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalha um servico do catalogo' })
  async findById(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ServiceDTO> {
    const httpResponse = await adaptNestRoute(this.findServiceCatalogByIdController, {
      body: undefined,
      params: { id },
      query: undefined,
    });

    res.status(httpResponse.statusCode);
    return httpResponse.body;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza um servico do catalogo' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateServiceRequestDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ServiceDTO> {
    const httpResponse = await adaptNestRoute(this.updateServiceCatalogController, {
      body: dto,
      params: { id },
      query: undefined,
    });

    res.status(httpResponse.statusCode);
    return httpResponse.body;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove um servico do catalogo' })
  async delete(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const httpResponse = await adaptNestRoute(this.deleteServiceCatalogController, {
      body: undefined,
      params: { id },
      query: undefined,
    });

    res.status(httpResponse.statusCode);
    return httpResponse.body;
  }
}
