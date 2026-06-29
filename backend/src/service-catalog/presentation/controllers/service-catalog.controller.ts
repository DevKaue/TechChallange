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
import { ServiceCatalogUseCase } from '@service-catalog/application/usecases/service-catalog.use-case';
import { ServiceDTO } from '@service-catalog/application/dtos/service.dtos';
import { CreateServiceRequestDto } from '@service-catalog/presentation/dto/create-service-request.dto';
import { UpdateServiceRequestDto } from '@service-catalog/presentation/dto/update-service-request.dto';
import { ServiceCatalogExceptionFilter } from '@service-catalog/presentation/filters/service-catalog-exception.filter';

@ApiTags('Service Catalog')
@ApiBearerAuth()
@Controller('services')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ATTENDANT)
@UseFilters(ServiceCatalogExceptionFilter)
export class ServiceCatalogController {
  constructor(private readonly useCase: ServiceCatalogUseCase) {}

  @Post()
  @ApiOperation({ summary: 'Cadastra um serviço no catálogo' })
  create(@Body() dto: CreateServiceRequestDto): Promise<ServiceDTO> {
    return this.useCase.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista os serviços do catálogo' })
  list(): Promise<ServiceDTO[]> {
    return this.useCase.list();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalha um serviço do catálogo' })
  findById(@Param('id') id: string): Promise<ServiceDTO> {
    return this.useCase.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza um serviço do catálogo' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateServiceRequestDto,
  ): Promise<ServiceDTO> {
    return this.useCase.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove um serviço do catálogo' })
  delete(@Param('id') id: string): Promise<void> {
    return this.useCase.delete(id);
  }
}
