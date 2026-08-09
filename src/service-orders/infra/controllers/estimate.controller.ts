import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { JwtAuthGuard } from '@/access-identity/infra/guards/jwt-auth.guard';
import { adaptNestRoute } from '@/common/adapters/nest-route.adapter';
import { DomainExceptionFilter } from '@/common/infra/filters/domain-exception.filter';
import { AddEstimateItemDto } from '@service-orders/application/dto/estimate/add-estimate-item.dto';
import {
  EstimateItemDto,
  EstimateResponseDto,
} from '@service-orders/application/dto/estimate/estimate-response.dto';
import { RejectEstimateDto } from '@service-orders/application/dto/estimate/reject-estimate.dto';
import { UpdateEstimateStatusDto } from '@service-orders/application/dto/estimate/update-estimate-status.dto';
import { ServiceOrderResponseDto } from '@service-orders/application/dto/service-order/service-order-response.dto';
import AddEstimateItemController from '@service-orders/presentation/controllers/add-estimate-item.controller';
import CreateEstimateController from '@service-orders/presentation/controllers/create-estimate.controller';
import RejectEstimateController from '@service-orders/presentation/controllers/reject-estimate.controller';
import UpdateEstimateStatusController from '@service-orders/presentation/controllers/update-estimate-status.controller';

@ApiTags('Service Orders')
@ApiBearerAuth()
@Controller('service-orders')
@UseGuards(JwtAuthGuard)
@UseFilters(DomainExceptionFilter)
export class EstimateInfraController {
  constructor(
    private readonly addEstimateItemController: AddEstimateItemController,
    private readonly createEstimateController: CreateEstimateController,
    private readonly rejectEstimateController: RejectEstimateController,
    private readonly updateEstimateStatusController: UpdateEstimateStatusController,
  ) {}

  @Post(':id/estimates')
  @ApiOperation({ summary: 'Gera o orcamento da OS e envia para aprovacao' })
  @ApiCreatedResponse({ type: EstimateResponseDto })
  async createEstimate(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<EstimateResponseDto> {
    const httpResponse = await adaptNestRoute(this.createEstimateController, {
      body: undefined,
      params: { id },
      query: undefined,
    });

    res.status(httpResponse.statusCode);
    return httpResponse.body;
  }

  @Post('estimates/:estimateId/items')
  @ApiOperation({ summary: 'Adiciona um item (peca/servico) ao orcamento' })
  @ApiCreatedResponse({ type: EstimateItemDto })
  async addEstimateItem(
    @Param('estimateId') estimateId: string,
    @Body() dto: AddEstimateItemDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<EstimateItemDto> {
    const httpResponse = await adaptNestRoute(this.addEstimateItemController, {
      body: dto,
      params: { estimateId },
      query: undefined,
    });

    res.status(httpResponse.statusCode);
    return httpResponse.body;
  }

  @Patch('estimates/:estimateId/status')
  @ApiOperation({ summary: 'Aprova ou rejeita o orcamento' })
  @ApiOkResponse({ type: EstimateResponseDto })
  async updateEstimateStatus(
    @Param('estimateId') estimateId: string,
    @Body() dto: UpdateEstimateStatusDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<EstimateResponseDto> {
    const httpResponse = await adaptNestRoute(this.updateEstimateStatusController, {
      body: dto,
      params: { estimateId },
      query: undefined,
    });

    res.status(httpResponse.statusCode);
    return httpResponse.body;
  }

  @Patch(':id/reject')
  @ApiOperation({ summary: 'Rejeita o orcamento e retorna a OS ao diagnostico' })
  @ApiOkResponse({ type: ServiceOrderResponseDto })
  async rejectEstimate(
    @Param('id') id: string,
    @Body() dto: RejectEstimateDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ServiceOrderResponseDto> {
    const httpResponse = await adaptNestRoute(this.rejectEstimateController, {
      body: dto,
      params: { id },
      query: undefined,
    });

    res.status(httpResponse.statusCode);
    return httpResponse.body;
  }
}
