import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import type { AuthenticatedRequest } from '@/access-identity/presentation/authenticated-request';
import { JwtAuthGuard } from '@/access-identity/infra/guards/jwt-auth.guard';
import { adaptNestRoute } from '@/common/presentation/adapters/nest-route.adapter';
import { DomainExceptionFilter } from '@/common/infra/filters/domain-exception.filter';
import { CreateServiceOrderDto } from '@service-orders/application/dto/service-order/create-service-order.dto';
import { FinishServiceOrderDto } from '@service-orders/application/dto/service-order/finish-service-order.dto';
import { ServiceOrderResponseDto } from '@service-orders/application/dto/service-order/service-order-response.dto';
import CloseServiceOrderController from '@service-orders/presentation/controllers/close-service-order.controller';
import CreateServiceOrderController from '@service-orders/presentation/controllers/create-service-order.controller';
import DeliverVehicleController from '@service-orders/presentation/controllers/deliver-vehicle.controller';
import FindAllServiceOrdersController from '@service-orders/presentation/controllers/find-all-service-orders.controller';
import FindOneServiceOrderController from '@service-orders/presentation/controllers/find-one-service-order.controller';
import FinishServiceController from '@service-orders/presentation/controllers/finish-service.controller';
import StartServiceController from '@service-orders/presentation/controllers/start-service.controller';
import {
  ServiceOrderDetailResponse,
  ServiceOrderSummaryResponse,
} from '@service-orders/presentation/presenters/service-order.presenter';

@ApiTags('Service Orders')
@ApiBearerAuth()
@Controller('service-orders')
@UseGuards(JwtAuthGuard)
@UseFilters(DomainExceptionFilter)
export class ServiceOrderInfraController {
  constructor(
    private readonly closeServiceOrderController: CloseServiceOrderController,
    private readonly createServiceOrderController: CreateServiceOrderController,
    private readonly deliverVehicleController: DeliverVehicleController,
    private readonly findAllServiceOrdersController: FindAllServiceOrdersController,
    private readonly findOneServiceOrderController: FindOneServiceOrderController,
    private readonly finishServiceController: FinishServiceController,
    private readonly startServiceController: StartServiceController,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Cria uma ordem de servico' })
  @ApiCreatedResponse({ type: ServiceOrderResponseDto })
  async create(
    @Body() dto: CreateServiceOrderDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ServiceOrderResponseDto> {
    const httpResponse = await adaptNestRoute(this.createServiceOrderController, {
      body: dto,
      params: undefined,
      query: undefined,
    });

    res.status(httpResponse.statusCode);
    return httpResponse.body;
  }

  @Get()
  @ApiOperation({ summary: 'Lista as ordens de servico' })
  @ApiOkResponse({ type: ServiceOrderResponseDto, isArray: true })
  async findAll(
    @Res({ passthrough: true }) res: Response,
  ): Promise<ServiceOrderSummaryResponse[]> {
    const httpResponse = await adaptNestRoute(this.findAllServiceOrdersController, {
      body: undefined,
      params: undefined,
      query: undefined,
    });

    res.status(httpResponse.statusCode);
    return httpResponse.body;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalha uma OS com historico de status' })
  @ApiOkResponse({ type: ServiceOrderResponseDto })
  async findOne(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ServiceOrderDetailResponse> {
    const httpResponse = await adaptNestRoute(this.findOneServiceOrderController, {
      body: undefined,
      params: { id },
      query: undefined,
    });

    res.status(httpResponse.statusCode);
    return httpResponse.body;
  }

  @Patch(':id/start-service')
  @ApiOperation({ summary: 'Inicia a execucao do servico' })
  async startService(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ServiceOrderResponseDto> {
    const httpResponse = await adaptNestRoute(this.startServiceController, {
      body: undefined,
      params: { id },
      query: undefined,
    });

    res.status(httpResponse.statusCode);
    return httpResponse.body;
  }

  @Patch(':id/finish')
  @ApiOperation({ summary: 'Finaliza o servico (apenas o mecanico atribuido)' })
  @ApiOkResponse({ type: ServiceOrderResponseDto })
  async finish(
    @Param('id') id: string,
    @Body() dto: FinishServiceOrderDto,
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ServiceOrderResponseDto> {
    const httpResponse = await adaptNestRoute(this.finishServiceController, {
      body: {
        ...dto,
        mechanicId: req.user.userId,
      },
      params: { id },
      query: undefined,
    });

    res.status(httpResponse.statusCode);
    return httpResponse.body;
  }

  @Patch(':id/deliver')
  @ApiOperation({ summary: 'Registra a entrega do veiculo' })
  @ApiOkResponse({ type: ServiceOrderResponseDto })
  async deliverVehicle(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ServiceOrderResponseDto> {
    const httpResponse = await adaptNestRoute(this.deliverVehicleController, {
      body: undefined,
      params: { id },
      query: undefined,
    });

    res.status(httpResponse.statusCode);
    return httpResponse.body;
  }

  @Patch(':id/close')
  @ApiOperation({ summary: 'Encerra a ordem de servico' })
  @ApiOkResponse({ type: ServiceOrderResponseDto })
  async close(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ServiceOrderResponseDto> {
    const httpResponse = await adaptNestRoute(this.closeServiceOrderController, {
      body: undefined,
      params: { id },
      query: undefined,
    });

    res.status(httpResponse.statusCode);
    return httpResponse.body;
  }
}
