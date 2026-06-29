import {
  Controller,
  Patch,
  Body,
  Param,
  UseGuards,
  UseFilters,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/access-identity/presentation/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { DiagnosisUseCase } from '@service-orders/application/usecases/diagnosis.use-case';
import { StartDiagnosisDto } from '@service-orders/application/dto/diagnosis/start-diagnosis.dto';
import { ServiceOrderResponseDto } from '@service-orders/application/dto/service-order/service-order-response.dto';

import { ServiceOrderExceptionFilter } from '@service-orders/presentation/filters/service-order-exception.filter';

@ApiTags('Service Orders')
@Controller('service-orders')
@UseFilters(ServiceOrderExceptionFilter)
export class DiagnosisController {
  constructor(private readonly useCase: DiagnosisUseCase) {}

  @Patch(':id/diagnosis')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Inicia o diagnóstico da OS' })
  @ApiOkResponse({ type: ServiceOrderResponseDto })
  startDiagnosis(@Param('id') id: string, @Body() dto: StartDiagnosisDto) {
    return this.useCase.startDiagnosis(id, dto);
  }
}
