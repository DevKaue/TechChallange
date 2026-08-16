import { Body, Controller, Param, Post, UseFilters } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { adaptNestRoute } from '@/common/presentation/adapters/nest-route.adapter';
import type { HttpResponse } from '@/common/application/contracts/http';
import { DomainExceptionFilter } from '@/common/infra/filters/domain-exception.filter';
import { EstimateResponseDto } from '@service-orders/application/dto/estimate/estimate-response.dto';
import { UpdateEstimateStatusExternalDto } from '@service-orders/application/dto/estimate/update-estimate-status-external.dto';
import UpdateEstimateStatusExternalController from '@service-orders/presentation/controllers/update-estimate-status-external.controller';

@ApiTags('Service Orders')
@Controller('service-orders')
@UseFilters(DomainExceptionFilter)
export class EstimateNotificationInfraController {
  constructor(
    private readonly updateEstimateStatusExternalController: UpdateEstimateStatusExternalController,
  ) {}

  @Post('estimates/:estimateId/external-status')
  @ApiOperation({
    summary: 'Recebe notificacao externa de aprovacao ou recusa do orcamento',
  })
  @ApiOkResponse({ type: EstimateResponseDto })
  updateEstimateStatusExternal(
    @Param('estimateId') estimateId: string,
    @Body() dto: UpdateEstimateStatusExternalDto,
  ): Promise<HttpResponse<EstimateResponseDto>> {
    return adaptNestRoute(this.updateEstimateStatusExternalController, {
      body: dto,
      params: { estimateId },
      query: undefined,
    });
  }
}
