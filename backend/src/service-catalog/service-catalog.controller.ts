import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ServiceCatalogService } from './service-catalog.service';
import { CreateServiceCatalogDto } from './dto/create-service-catalog.dto';
import { UpdateServiceCatalogDto } from './dto/update-service-catalog.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Service Catalog')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('service-catalog')
export class ServiceCatalogController {
  constructor(private readonly serviceCatalogService: ServiceCatalogService) {}

  @Post()
  create(@Body() createServiceCatalogDto: CreateServiceCatalogDto) {
    return this.serviceCatalogService.create(createServiceCatalogDto);
  }

  @Get()
  findAll() {
    return this.serviceCatalogService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.serviceCatalogService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateServiceCatalogDto: UpdateServiceCatalogDto) {
    return this.serviceCatalogService.update(id, updateServiceCatalogDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.serviceCatalogService.remove(id);
  }
}
