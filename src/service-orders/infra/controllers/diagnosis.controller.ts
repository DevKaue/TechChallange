import {
  Body,
  Controller,
  Param,
  Patch,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { JwtAuthGuard } from '@/access-identity/infra/guards/jwt-auth.guard';
import { adaptNestRoute } from '@/common/adapters/nest-route.adapter';
import { DomainExceptionFilter } from '@/common/infra/filters/domain-exception.filter';
import { StartDiagnosisDto } from '@service-orders/application/dto/diagnosis/start-diagnosis.dto';
import { ServiceOrderResponseDto } from '@service-orders/application/dto/service-order/service-order-response.dto';
import StartDiagnosisController from '@service-orders/presentation/controllers/start-diagnosis.controller';

@ApiTags('Service Orders')
@ApiBearerAuth()
@Controller('service-orders')
@UseGuards(JwtAuthGuard)
@UseFilters(DomainExceptionFilter)
export class DiagnosisInfraController {
  constructor(
    private readonly startDiagnosisController: StartDiagnosisController,
  ) {}

  @Patch(':id/diagnosis')
  @ApiOperation({ summary: 'Inicia o diagnostico da OS' })
  @ApiOkResponse({ type: ServiceOrderResponseDto })
  async startDiagnosis(
    @Param('id') id: string,
    @Body() dto: StartDiagnosisDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ServiceOrderResponseDto> {
    const httpResponse = await adaptNestRoute(this.startDiagnosisController, {
      body: dto,
      params: { id },
      query: undefined,
    });

    res.status(httpResponse.statusCode);
    return httpResponse.body;
  }
}
