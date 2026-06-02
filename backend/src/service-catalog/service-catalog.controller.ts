import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ServiceCatalogService } from './service-catalog.service';
import { CreateServiceCatalogDto } from './dto/create-service-catalog.dto';
import { UpdateServiceCatalogDto } from './dto/update-service-catalog.dto';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiTags,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { ServiceCatalogResponseDto } from './dto/service-catalog-response.dto';

@ApiTags('Service Catalog')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('service-catalog')
export class ServiceCatalogController {
  constructor(private readonly serviceCatalogService: ServiceCatalogService) {}

  @Post()
  @ApiCreatedResponse({ type: ServiceCatalogResponseDto })
  create(@Body() createServiceCatalogDto: CreateServiceCatalogDto) {
    return this.serviceCatalogService.create(createServiceCatalogDto);
  }

  @Get()
  @ApiOkResponse({ type: ServiceCatalogResponseDto, isArray: true })
  findAll() {
    return this.serviceCatalogService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: ServiceCatalogResponseDto })
  findOne(@Param('id') id: string) {
    return this.serviceCatalogService.findOne(id);
  }

  @Patch(':id')
  @ApiOkResponse({ type: ServiceCatalogResponseDto })
  update(
    @Param('id') id: string,
    @Body() updateServiceCatalogDto: UpdateServiceCatalogDto,
  ) {
    return this.serviceCatalogService.update(id, updateServiceCatalogDto);
  }

  @Delete(':id')
  @ApiOkResponse({ type: ServiceCatalogResponseDto })
  remove(@Param('id') id: string) {
    return this.serviceCatalogService.remove(id);
  }
}
