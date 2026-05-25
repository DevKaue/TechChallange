import { Controller, Get, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { ServiceOrdersService } from './service-orders.service';
import { CreateServiceOrderDto } from './dto/create-service-order.dto';
import { UpdateServiceOrderStatusDto } from './dto/update-service-order-status.dto';
import { AddItemToOrderDto } from './dto/add-item-to-order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Service Orders')
@Controller('service-orders')
export class ServiceOrdersController {
  constructor(private readonly serviceOrdersService: ServiceOrdersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  create(@Body() createDto: CreateServiceOrderDto) {
    return this.serviceOrdersService.create(createDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findAll() {
    return this.serviceOrdersService.findAll();
  }

  @Get('metrics/average-time')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getAverageExecutionTime() {
    return this.serviceOrdersService.getAverageExecutionTime();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.serviceOrdersService.findOne(id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  updateStatus(@Param('id') id: string, @Body() updateDto: UpdateServiceOrderStatusDto) {
    return this.serviceOrdersService.updateStatus(id, updateDto);
  }

  @Post(':id/services')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  addService(@Param('id') id: string, @Body() addDto: AddItemToOrderDto) {
    return this.serviceOrdersService.addService(id, addDto);
  }

  @Post(':id/parts')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  addPart(@Param('id') id: string, @Body() addDto: AddItemToOrderDto) {
    return this.serviceOrdersService.addPart(id, addDto);
  }

  @Patch(':id/budget')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  generateBudget(@Param('id') id: string) {
    return this.serviceOrdersService.generateBudget(id);
  }
}
