import {
  Body,
  Controller,
  Param,
  Patch,
  Req,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import type { AuthenticatedRequest } from '@/access-identity/presentation/authenticated-request';
import { JwtAuthGuard } from '@/access-identity/infra/guards/jwt-auth.guard';
import { adaptNestRoute } from '@/common/adapters/nest-route.adapter';
import { DomainExceptionFilter } from '@/common/infra/filters/domain-exception.filter';
import { AssignMechanicDto } from '@service-orders/application/dto/mechanic/assign-mechanic.dto';
import { UpdateMechanicAvailabilityDto } from '@service-orders/application/dto/mechanic/update-mechanic-availability.dto';
import { ServiceOrderResponseDto } from '@service-orders/application/dto/service-order/service-order-response.dto';
import AssignMechanicController from '@service-orders/presentation/controllers/assign-mechanic.controller';
import UpdateMechanicAvailabilityController from '@service-orders/presentation/controllers/update-mechanic-availability.controller';

@ApiTags('Service Orders')
@ApiBearerAuth()
@Controller('service-orders')
@UseGuards(JwtAuthGuard)
@UseFilters(DomainExceptionFilter)
export class MechanicInfraController {
  constructor(
    private readonly assignMechanicController: AssignMechanicController,
    private readonly updateMechanicAvailabilityController: UpdateMechanicAvailabilityController,
  ) {}

  @Patch(':id/mechanic')
  @ApiOperation({ summary: 'Atribui um mecanico a OS' })
  @ApiOkResponse({ type: ServiceOrderResponseDto })
  async assignMechanic(
    @Param('id') id: string,
    @Body() dto: AssignMechanicDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ServiceOrderResponseDto> {
    const httpResponse = await adaptNestRoute(this.assignMechanicController, {
      body: dto,
      params: { id },
      query: undefined,
    });

    res.status(httpResponse.statusCode);
    return httpResponse.body;
  }

  @Patch('me/availability')
  @ApiOperation({ summary: 'Atualiza a disponibilidade do mecanico logado' })
  async updateMechanicAvailability(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateMechanicAvailabilityDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const httpResponse = await adaptNestRoute(
      this.updateMechanicAvailabilityController,
      {
        body: dto,
        params: { mechanicId: req.user.userId },
        query: undefined,
      },
    );

    res.status(httpResponse.statusCode);
    return httpResponse.body;
  }
}
