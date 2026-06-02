import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ServiceOrdersUseCase } from './service-orders.use-case';
import { CreateServiceOrderDto } from './dto/create-service-order.dto';
import { UpdateServiceOrderStatusDto } from './dto/update-service-order-status.dto';
import { AddItemToOrderDto } from './dto/add-item-to-order.dto';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Service Orders')
@Controller('service-orders')
export class ServiceOrdersController {
  constructor(
    private readonly serviceOrdersUseCase: ServiceOrdersUseCase,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  create(@Body() dto: CreateServiceOrderDto) {
    return this.serviceOrdersUseCase.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findAll() {
    return this.serviceOrdersUseCase.findAll();
  }

  @Get('metrics/average-time')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getAverageExecutionTime() {
    return this.serviceOrdersUseCase.getAverageExecutionTime();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.serviceOrdersUseCase.findOne(id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateServiceOrderStatusDto,
  ) {
    return this.serviceOrdersUseCase.updateStatus(id, dto);
  }

  @Post(':id/services')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  addService(@Param('id') id: string, @Body() dto: AddItemToOrderDto) {
    return this.serviceOrdersUseCase.addService(id, dto);
  }

  @Post(':id/parts')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  addPart(@Param('id') id: string, @Body() dto: AddItemToOrderDto) {
    return this.serviceOrdersUseCase.addPart(id, dto);
  }

  @Patch(':id/budget')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  generateBudget(@Param('id') id: string) {
    return this.serviceOrdersUseCase.generateBudget(id);
  }
}
