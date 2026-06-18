import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/access-identity/presentation/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { AuthenticatedRequest } from '@/access-identity/presentation/authenticated-request';
import { ServiceOrderUseCase } from '@service-orders/application/usecases/service-order.use-case';
import { CreateServiceOrderDto } from '@service-orders/application/dto/service-order/create-service-order.dto';
import { FinishServiceOrderDto } from '@service-orders/application/dto/service-order/finish-service-order.dto';
import { ServiceOrderResponseDto } from '@service-orders/application/dto/service-order/service-order-response.dto';

@ApiTags('Service Orders')
@Controller('service-orders')
export class ServiceOrderController {
  constructor(private readonly useCase: ServiceOrderUseCase) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: ServiceOrderResponseDto })
  create(@Body() dto: CreateServiceOrderDto) {
    return this.useCase.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: ServiceOrderResponseDto, isArray: true })
  findAll() {
    return this.useCase.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: ServiceOrderResponseDto })
  findOne(@Param('id') id: string) {
    return this.useCase.findOne(id);
  }

  @Patch(':id/start-service')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  startService(@Param('id') id: string) {
    return this.useCase.startService(id);
  }

  @Patch(':id/finish')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: ServiceOrderResponseDto })
  finish(
    @Param('id') id: string,
    @Body() dto: FinishServiceOrderDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.useCase.finish(id, req.user.id, dto.notes);
  }

  @Patch(':id/deliver')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: ServiceOrderResponseDto })
  deliverVehicle(@Param('id') id: string) {
    return this.useCase.deliverVehicle(id);
  }

  @Patch(':id/close')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: ServiceOrderResponseDto })
  close(@Param('id') id: string) {
    return this.useCase.close(id);
  }
}
