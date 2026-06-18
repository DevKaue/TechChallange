import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ServiceOrdersUseCase } from '@/service-orders/application/usecases/service-orders.use-case';
import { CreateServiceOrderDto } from '@/service-orders/application/dto/service-order/create-service-order.dto';
import { AddEstimateItemDto } from '@/service-orders/application/dto/estimate/add-estimate-item.dto';
import { UpdateEstimateStatusDto } from '@/service-orders/application/dto/estimate/update-estimate-status.dto';
import { AssignMechanicDto } from '@/service-orders/application/dto/mechanic/assign-mechanic.dto';
import { StartDiagnosisDto } from '@/service-orders/application/dto/diagnosis/start-diagnosis.dto';
import { RejectEstimateDto } from '@/service-orders/application/dto/estimate/reject-estimate.dto';
import { JwtAuthGuard } from '@/access-identity/presentation/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ServiceOrderResponseDto } from '@/service-orders/application/dto/service-order/service-order-response.dto';
import {
  EstimateItemDto,
  EstimateResponseDto,
} from '@/service-orders/application/dto/estimate/estimate-response.dto';
import type { AuthenticatedRequest } from '@/access-identity/presentation/authenticated-request';
import { UpdateMechanicAvailabilityDto } from '@/service-orders/application/dto/mechanic/update-mechanic-availability.dto';
import { FinishServiceOrderDto } from '@/service-orders/application/dto/service-order/finish-service-order.dto';

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

  @Patch(':id/start-service')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  startService(@Param('id') id: string) {
    return this.serviceOrdersUseCase.startService(id);
  }

  @Patch('me/availability')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  updateMechanicAvailability(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateMechanicAvailabilityDto,
  ) {
    return this.serviceOrdersUseCase.updateMechanicAvailability(
      req.user.id,
      dto.available,
    );
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
  finish(
    @Param('id') id: string,
    @Body() dto: FinishServiceOrderDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.serviceOrdersUseCase.finish(id, req.user.id, dto.notes);
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
