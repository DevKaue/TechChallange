import {
  Controller,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  UseFilters,
} from '@nestjs/common';
import { ServiceOrderExceptionFilter } from '@service-orders/presentation/filters/service-order-exception.filter';
import { JwtAuthGuard } from '@/access-identity/presentation/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { EstimateUseCase } from '@service-orders/application/usecases/estimate.use-case';
import { AddEstimateItemDto } from '@service-orders/application/dto/estimate/add-estimate-item.dto';
import { UpdateEstimateStatusDto } from '@service-orders/application/dto/estimate/update-estimate-status.dto';
import { RejectEstimateDto } from '@service-orders/application/dto/estimate/reject-estimate.dto';
import {
  EstimateResponseDto,
  EstimateItemDto,
} from '@service-orders/application/dto/estimate/estimate-response.dto';
import { ServiceOrderResponseDto } from '@service-orders/application/dto/service-order/service-order-response.dto';

@ApiTags('Service Orders')
@Controller('service-orders')
@UseFilters(ServiceOrderExceptionFilter)
export class EstimateController {
  constructor(private readonly useCase: EstimateUseCase) {}

  @Post(':id/estimates')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: EstimateResponseDto })
  createEstimate(@Param('id') id: string) {
    return this.useCase.createEstimate(id);
  }

  @Post('estimates/:estimateId/items')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: EstimateItemDto })
  addEstimateItem(
    @Param('estimateId') estimateId: string,
    @Body() dto: AddEstimateItemDto,
  ) {
    return this.useCase.addEstimateItem(estimateId, dto);
  }

  @Patch('estimates/:estimateId/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: EstimateResponseDto })
  updateEstimateStatus(
    @Param('estimateId') estimateId: string,
    @Body() dto: UpdateEstimateStatusDto,
  ) {
    return this.useCase.updateEstimateStatus(estimateId, dto);
  }

  @Patch(':id/reject')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: ServiceOrderResponseDto })
  rejectEstimate(@Param('id') id: string, @Body() dto: RejectEstimateDto) {
    return this.useCase.rejectEstimate(id, dto);
  }
}
