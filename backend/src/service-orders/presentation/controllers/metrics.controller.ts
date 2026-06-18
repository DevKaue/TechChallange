import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/access-identity/presentation/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { MetricsUseCase } from '@service-orders/application/usecases/metrics.use-case';

@ApiTags('Service Orders')
@Controller('service-orders')
export class MetricsController {
  constructor(private readonly useCase: MetricsUseCase) {}

  @Get('metrics/average-time')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: Object })
  getAverageExecutionTime() {
    return this.useCase.getAverageExecutionTime();
  }
}
