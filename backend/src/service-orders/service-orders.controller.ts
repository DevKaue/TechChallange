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
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ServiceOrderResponseDto } from './dto/service-order/service-order-response.dto';
import {
  EstimateItemDto,
  EstimateResponseDto,
} from './dto/estimate/estimate-response.dto';

@ApiTags('Service Orders')
@Controller('service-orders')
export class ServiceOrdersController {
  constructor(private readonly serviceOrdersUseCase: ServiceOrdersUseCase) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: ServiceOrderResponseDto })
  create(@Body() dto: CreateServiceOrderDto) {
    return this.serviceOrdersUseCase.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: ServiceOrderResponseDto, isArray: true })
  findAll() {
    return this.serviceOrdersUseCase.findAll();
  }

  @Get('metrics/average-time')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: Object })
  getAverageExecutionTime() {
    return this.serviceOrdersUseCase.getAverageExecutionTime();
  }

  @Get(':id')
  @ApiOkResponse({ type: ServiceOrderResponseDto })
  findOne(@Param('id') id: string) {
    return this.serviceOrdersUseCase.findOne(id);
  }

  @Patch(':id/mechanic')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: ServiceOrderResponseDto })
  assignMechanic(@Param('id') id: string, @Body() dto: AssignMechanicDto) {
    return this.serviceOrdersUseCase.assignMechanic(id, dto);
  }

  @Patch(':id/diagnosis')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: ServiceOrderResponseDto })
  startDiagnosis(@Param('id') id: string, @Body() dto: StartDiagnosisDto) {
    return this.serviceOrdersUseCase.startDiagnosis(id, dto);
  }

  @Post(':id/estimates')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: EstimateResponseDto })
  createEstimate(@Param('id') id: string) {
    return this.serviceOrdersUseCase.createEstimate(id);
  }

  @Post('estimates/:estimateId/items')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: EstimateItemDto })
  addEstimateItem(
    @Param('estimateId') estimateId: string,
    @Body() dto: AddEstimateItemDto,
  ) {
    return this.serviceOrdersUseCase.addEstimateItem(estimateId, dto);
  }

  @Patch('estimates/:estimateId/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: EstimateResponseDto })
  updateEstimateStatus(
    @Param('estimateId') estimateId: string,
    @Body() dto: UpdateEstimateStatusDto,
  ) {
    return this.serviceOrdersUseCase.updateEstimateStatus(estimateId, dto);
  }

  @Patch(':id/reject')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: ServiceOrderResponseDto })
  rejectEstimate(@Param('id') id: string, @Body() dto: RejectEstimateDto) {
    return this.serviceOrdersUseCase.rejectEstimate(id, dto);
  }

  @Patch(':id/finish')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: ServiceOrderResponseDto })
  finish(@Param('id') id: string) {
    return this.serviceOrdersUseCase.finish(id);
  }

  @Patch(':id/deliver')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: ServiceOrderResponseDto })
  deliverVehicle(@Param('id') id: string) {
    return this.serviceOrdersUseCase.deliverVehicle(id);
  }

  @Patch(':id/close')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: ServiceOrderResponseDto })
  close(@Param('id') id: string) {
    return this.serviceOrdersUseCase.close(id);
  }
}
