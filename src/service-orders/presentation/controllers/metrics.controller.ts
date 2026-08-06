import { Controller, Get, UseGuards, UseFilters } from '@nestjs/common';
import { JwtAuthGuard } from '@/access-identity/presentation/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
//import { MetricsUseCase } from '@/service-orders/application/usecases/metrics/get-avetage-execution-time.use-case';

import { ServiceOrderExceptionFilter } from '@service-orders/presentation/filters/service-order-exception.filter';
import { GetAverageExecutionTimeUseCase } from '@/service-orders/application/usecases/metrics/get-avetage-execution-time.use-case';

@ApiTags('Service Orders')
@Controller('service-orders')
@UseFilters(ServiceOrderExceptionFilter)
export class MetricsController {
  constructor(private readonly useCase: GetAverageExecutionTimeUseCase) {}

  @Get('metrics/average-time')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Tempo médio de execução (IN_EXECUTION → FINISHED)',
  })
  @ApiOkResponse({ type: Object })
  getAverageExecutionTime() {
    return this.useCase.getAverageExecutionTime();
  }
}
