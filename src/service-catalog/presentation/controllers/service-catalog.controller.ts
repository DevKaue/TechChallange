import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/access-identity/presentation/guards/jwt-auth.guard';
import { RolesGuard } from '@/access-identity/presentation/guards/roles.guard';
import { Roles } from '@/access-identity/presentation/decorators/roles.decorator';
import { UserRole } from '@/access-identity/domain/enums/user-role.enum';
//import { ServiceCatalogUseCase } from '@service-catalog/application/usecases/service-catalog.use-case';
import type { ServiceDTO } from '@service-catalog/application/dtos/service.dtos';
import { CreateServiceRequestDto } from '@service-catalog/presentation/dto/create-service-request.dto';
import { UpdateServiceRequestDto } from '@service-catalog/presentation/dto/update-service-request.dto';
import { ServiceCatalogExceptionFilter } from '@service-catalog/presentation/filters/service-catalog-exception.filter';

import { CreateServiceCatalogUseCase } from '@/service-catalog/application/usecases/create-service-catalog.use-case';
import { ListServiceCatalogUseCase } from '@/service-catalog/application/usecases/list-service-catalog.use-case';
import { FindByIdServiceCatalogUseCase } from '@/service-catalog/application/usecases/find-by-id-service-catalog.use-case';
import { UpdateServiceCatalogUseCase } from '@/service-catalog/application/usecases/update-service-catalog.use-case';
import { DeleteServiceCatalogUseCase } from '@/service-catalog/application/usecases/delete-service-catalog.use-case';

@ApiTags('Service Catalog')
@ApiBearerAuth()
@Controller('services')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ATTENDANT)
@UseFilters(ServiceCatalogExceptionFilter)
export class ServiceCatalogController {
  constructor(
    //private readonly useCase: ServiceCatalogUseCase.
    private readonly createServiceCatalogUseCase: CreateServiceCatalogUseCase,
    private readonly listServiceCatalogUseCase: ListServiceCatalogUseCase,
    private readonly findByIdServiceCatalogUseCase: FindByIdServiceCatalogUseCase,
    private readonly updateServiceCatalogUseCase: UpdateServiceCatalogUseCase,
    private readonly deleteServiceCatalogUseCase: DeleteServiceCatalogUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Cadastra um serviço no catálogo' })
  create(@Body() dto: CreateServiceRequestDto): Promise<ServiceDTO> {
    return this.createServiceCatalogUseCase.execute(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista os serviços do catálogo' })
  list(): Promise<ServiceDTO[]> {
    return this.listServiceCatalogUseCase.execute();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalha um serviço do catálogo' })
  findById(@Param('id') id: string): Promise<ServiceDTO> {
    return this.findByIdServiceCatalogUseCase.execute(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza um serviço do catálogo' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateServiceRequestDto,
  ): Promise<ServiceDTO> {
    return this.updateServiceCatalogUseCase.execute(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove um serviço do catálogo' })
  delete(@Param('id') id: string): Promise<void> {
    return this.deleteServiceCatalogUseCase.execute(id);
  }
}
