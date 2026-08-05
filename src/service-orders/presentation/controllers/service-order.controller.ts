import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  UseFilters,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/access-identity/presentation/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { AuthenticatedRequest } from '@/access-identity/presentation/authenticated-request';
//import { ServiceOrderUseCase } from '@/service-orders/application/usecases/service-order/service-order.use-case';
import { CreateServiceOrderDto } from '@service-orders/application/dto/service-order/create-service-order.dto';
import { FinishServiceOrderDto } from '@service-orders/application/dto/service-order/finish-service-order.dto';
import { ServiceOrderResponseDto } from '@service-orders/application/dto/service-order/service-order-response.dto';
import { ServiceOrderExceptionFilter } from '@service-orders/presentation/filters/service-order-exception.filter';
import {
  ServiceOrderPresenter,
  ServiceOrderSummaryResponse,
  ServiceOrderDetailResponse,
} from '@service-orders/presentation/presenters/service-order.presenter';
import { CloseServiceOrderUseCase } from '@/service-orders/application/usecases/service-order/close-service-order.use-case';
import { CreateServiceOrderUseCase } from '@/service-orders/application/usecases/service-order/create-service-order.use-case';
import { DeliverVehicleUseCase } from '@/service-orders/application/usecases/service-order/deliver-vehicle.use-case';
import { FindAllServiceOrdersUseCase } from '@/service-orders/application/usecases/service-order/find-all-service-orders.use-case';
import { FindOneServiceOrderUseCase } from '@/service-orders/application/usecases/service-order/find-one-service-order.use-case';
import { StartServiceUseCase } from '@/service-orders/application/usecases/service-order/start-service.use-case';
import { FinishServiceUseCase } from '@/service-orders/application/usecases/service-order/finish-service.use-case';

@ApiTags('Service Orders')
@Controller('service-orders')
@UseFilters(ServiceOrderExceptionFilter)
export class ServiceOrderController {
  constructor(
    private readonly closeServiceOrderUseCase: CloseServiceOrderUseCase,
    private readonly createServiceOrderUseCase: CreateServiceOrderUseCase,
    private readonly deliverVehicleUseCase: DeliverVehicleUseCase,
    private readonly findAllServiceOrdersUseCase: FindAllServiceOrdersUseCase,
    private readonly findOneServiceOrderUseCase: FindOneServiceOrderUseCase,
    private readonly finishServiceOrderUseCase: FinishServiceUseCase,
    private readonly startServiceUseCase: StartServiceUseCase,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cria uma ordem de serviço' })
  @ApiCreatedResponse({ type: ServiceOrderResponseDto })
  create(@Body() dto: CreateServiceOrderDto) {
    return this.createServiceOrderUseCase.execute(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lista as ordens de serviço' })
  @ApiOkResponse({ type: ServiceOrderResponseDto, isArray: true })
  findAll(): Promise<ServiceOrderSummaryResponse[]> {
    // return this.useCase
    //   .findAll()
    //   .then((dtos) => ServiceOrderPresenter.presentMany(dtos));
    return this.findAllServiceOrdersUseCase.execute()
      .then((dtos) => ServiceOrderPresenter.presentMany(dtos));
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Detalha uma OS com histórico de status' })
  @ApiOkResponse({ type: ServiceOrderResponseDto })
  findOne(@Param('id') id: string): Promise<ServiceOrderDetailResponse> {
    // return this.useCase
    //   .findOne(id)
    //   .then((dto) => ServiceOrderPresenter.presentDetail(dto));
    return this.findOneServiceOrderUseCase.execute(id)
      .then((dto) => ServiceOrderPresenter.presentDetail(dto));
  }

  @Patch(':id/start-service')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Inicia a execução do serviço' })
  startService(@Param('id') id: string) {
    return this.startServiceUseCase.execute(id);
  }

  @Patch(':id/finish')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Finaliza o serviço (apenas o mecânico atribuído)' })
  @ApiOkResponse({ type: ServiceOrderResponseDto })
  finish(
    @Param('id') id: string,
    @Body() dto: FinishServiceOrderDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.finishServiceOrderUseCase.execute(id, req.user.userId, dto.notes);
  }

  @Patch(':id/deliver')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Registra a entrega do veículo' })
  @ApiOkResponse({ type: ServiceOrderResponseDto })
  deliverVehicle(@Param('id') id: string) {
    return this.deliverVehicleUseCase.execute(id);
  }

  @Patch(':id/close')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Encerra a ordem de serviço' })
  @ApiOkResponse({ type: ServiceOrderResponseDto })
  close(@Param('id') id: string) {
    return this.closeServiceOrderUseCase.execute(id);
  }
}
