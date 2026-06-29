import {
  Controller,
  Patch,
  Body,
  Param,
  UseGuards,
  UseFilters,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/access-identity/presentation/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { AuthenticatedRequest } from '@/access-identity/presentation/authenticated-request';
import { MechanicUseCase } from '@service-orders/application/usecases/mechanic.use-case';
import { AssignMechanicDto } from '@service-orders/application/dto/mechanic/assign-mechanic.dto';
import { UpdateMechanicAvailabilityDto } from '@service-orders/application/dto/mechanic/update-mechanic-availability.dto';
import { ServiceOrderResponseDto } from '@service-orders/application/dto/service-order/service-order-response.dto';
import { ServiceOrderExceptionFilter } from '@service-orders/presentation/filters/service-order-exception.filter';

@ApiTags('Service Orders')
@UseFilters(ServiceOrderExceptionFilter)
@Controller('service-orders')
export class MechanicController {
  constructor(private readonly useCase: MechanicUseCase) {}

  @Patch(':id/mechanic')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atribui um mecânico à OS' })
  @ApiOkResponse({ type: ServiceOrderResponseDto })
  assignMechanic(@Param('id') id: string, @Body() dto: AssignMechanicDto) {
    return this.useCase.assignMechanic(id, dto);
  }

  @Patch('me/availability')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualiza a disponibilidade do mecânico logado' })
  updateMechanicAvailability(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateMechanicAvailabilityDto,
  ) {
    return this.useCase.updateMechanicAvailability(
      req.user.userId,
      dto.available,
    );
  }
}
