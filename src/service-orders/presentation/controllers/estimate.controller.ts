import {
  Controller,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  UseFilters,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ServiceOrderExceptionFilter } from '@service-orders/presentation/filters/service-order-exception.filter';
import { JwtAuthGuard } from '@/access-identity/presentation/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
//import { EstimateUseCase } from '@/service-orders/application/usecases/estimate/estimate.use-case';
import { AddEstimateItemDto } from '@service-orders/application/dto/estimate/add-estimate-item.dto';
import { UpdateEstimateStatusDto } from '@service-orders/application/dto/estimate/update-estimate-status.dto';
import { EstimateApprovalNotificationDto } from '@service-orders/application/dto/estimate/estimate-approval-notification.dto';
import { RejectEstimateDto } from '@service-orders/application/dto/estimate/reject-estimate.dto';
import {
  EstimateResponseDto,
  EstimateItemDto,
} from '@service-orders/application/dto/estimate/estimate-response.dto';
import { ServiceOrderResponseDto } from '@service-orders/application/dto/service-order/service-order-response.dto';
import { CreateEstimateUseCase } from '@/service-orders/application/usecases/estimate/create-estimate.use-case';
import { AddEstimateItemUseCase } from '@/service-orders/application/usecases/estimate/add-estimate-item.use-case';
import { RejectEstimateUseCase } from '@/service-orders/application/usecases/estimate/reject-estimate.use-case';
import { UpdateEstimateStatusUseCase } from '@/service-orders/application/usecases/estimate/update-estimate-status.use-case';

@ApiTags('Service Orders')
@Controller('service-orders')
@UseFilters(ServiceOrderExceptionFilter)
export class EstimateController {
  //constructor(private readonly useCase: EstimateUseCase) {}
  constructor(
    private readonly createEstimateUseCase: CreateEstimateUseCase,
    private readonly addEstimateItemUseCase: AddEstimateItemUseCase,
    private readonly updateEstimateStatusUseCase: UpdateEstimateStatusUseCase,
    private readonly rejectEstimateUseCase: RejectEstimateUseCase,
  ) {}

  @Post(':id/estimates')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Gera o orçamento da OS e envia para aprovação' })
  @ApiCreatedResponse({ type: EstimateResponseDto })
  createEstimate(@Param('id') id: string) {
    return this.createEstimateUseCase.execute(id);
  }

  @Post('estimates/:estimateId/items')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Adiciona um item (peça/serviço) ao orçamento' })
  @ApiCreatedResponse({ type: EstimateItemDto })
  addEstimateItem(
    @Param('estimateId') estimateId: string,
    @Body() dto: AddEstimateItemDto,
  ) {
    return this.addEstimateItemUseCase.execute(estimateId, dto);
  }

  @Patch('estimates/:estimateId/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Aprova ou rejeita o orçamento' })
  @ApiOkResponse({ type: EstimateResponseDto })
  updateEstimateStatus(
    @Param('estimateId') estimateId: string,
    @Body() dto: UpdateEstimateStatusDto,
  ) {
    return this.updateEstimateStatusUseCase.execute(estimateId, dto);
  }

  @Post('estimates/:estimateId/approval-notifications')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Recebe aprovação ou recusa externa do orçamento' })
  @ApiOkResponse({ type: EstimateResponseDto })
  handleApprovalNotification(
    @Param('estimateId') estimateId: string,
    @Body() dto: EstimateApprovalNotificationDto,
  ) {
    return this.updateEstimateStatusUseCase.execute(
      estimateId,
      dto,
      'external-notification',
    );
  }

  @Patch(':id/reject')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Rejeita o orçamento e retorna a OS ao diagnóstico',
  })
  @ApiOkResponse({ type: ServiceOrderResponseDto })
  rejectEstimate(@Param('id') id: string, @Body() dto: RejectEstimateDto) {
    return this.rejectEstimateUseCase.execute(id, dto);
  }
}
