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
import { CreateServiceOrderDto } from './dto/service-order/create-service-order.dto';
import { AddEstimateItemDto } from './dto/estimate/add-estimate-item.dto';
import { UpdateEstimateStatusDto } from './dto/estimate/update-estimate-status.dto';
import { AssignMechanicDto } from './dto/mechanic/assign-mechanic.dto';
import { StartDiagnosisDto } from './dto/diagnosis/start-diagnosis.dto';
import { RejectEstimateDto } from './dto/estimate/reject-estimate.dto';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Service Orders')
@Controller('service-orders')
export class ServiceOrdersController {
  constructor(private readonly serviceOrdersUseCase: ServiceOrdersUseCase) {}

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
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findOne(@Param('id') id: string) {
    return this.serviceOrdersUseCase.findOne(id);
  }

  @Patch(':id/mechanic')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  assignMechanic(@Param('id') id: string, @Body() dto: AssignMechanicDto) {
    return this.serviceOrdersUseCase.assignMechanic(id, dto);
  }

  @Patch(':id/diagnosis')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  startDiagnosis(@Param('id') id: string, @Body() dto: StartDiagnosisDto) {
    return this.serviceOrdersUseCase.startDiagnosis(id, dto);
  }

  @Post(':id/estimates')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  createEstimate(@Param('id') id: string) {
    return this.serviceOrdersUseCase.createEstimate(id);
  }

  @Post('estimates/:estimateId/items')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  addEstimateItem(
    @Param('estimateId') estimateId: string,
    @Body() dto: AddEstimateItemDto,
  ) {
    return this.serviceOrdersUseCase.addEstimateItem(estimateId, dto);
  }

  @Patch('estimates/:estimateId/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  updateEstimateStatus(
    @Param('estimateId') estimateId: string,
    @Body() dto: UpdateEstimateStatusDto,
  ) {
    return this.serviceOrdersUseCase.updateEstimateStatus(estimateId, dto);
  }

  @Patch(':id/reject')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  rejectEstimate(@Param('id') id: string, @Body() dto: RejectEstimateDto) {
    return this.serviceOrdersUseCase.rejectEstimate(id, dto);
  }

  @Patch(':id/finish')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  finish(@Param('id') id: string) {
    return this.serviceOrdersUseCase.finish(id);
  }

  @Patch(':id/deliver')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  deliverVehicle(@Param('id') id: string) {
    return this.serviceOrdersUseCase.deliverVehicle(id);
  }

  @Patch(':id/close')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  close(@Param('id') id: string) {
    return this.serviceOrdersUseCase.close(id);
  }
}
