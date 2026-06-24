import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Inject,
  Optional,
} from '@nestjs/common';
import { ServiceOrdersRepositoryInterface } from '@service-orders/domain/contracts/service-orders-repository.interface';
import { PART_REPOSITORY } from '@service-orders/domain/acls/part-repository.interface';
import type { PartRepository } from '@service-orders/domain/acls/part-repository.interface';
import { SERVICE_CATALOG_REPOSITORY } from '@service-orders/domain/acls/service-catalog-repository.interface';
import type { ServiceCatalogRepository } from '@service-orders/domain/acls/service-catalog-repository.interface';
import { ServiceOrderMapper } from '@service-orders/domain/mappers/service-order.mapper';
import { Money } from '@service-orders/domain/value-objects/money.value-object';
import { EstimateStatus } from '@service-orders/domain/enums/estimate-status.enum';
import {
  EstimateResponseDto,
  EstimateItemDto,
} from '@service-orders/application/dto/estimate/estimate-response.dto';
import { AddEstimateItemDto } from '@service-orders/application/dto/estimate/add-estimate-item.dto';
import { UpdateEstimateStatusDto } from '@service-orders/application/dto/estimate/update-estimate-status.dto';
import { RejectEstimateDto } from '@service-orders/application/dto/estimate/reject-estimate.dto';
import { ServiceOrderResponseDto } from '@service-orders/application/dto/service-order/service-order-response.dto';
import { plainToInstance } from 'class-transformer';
import InsufficientMaterialStockException from '@materials/domain/exceptions/insufficient-material-stock.exception';
import DomainException from '@materials/domain/exceptions/domain.exception';

@Injectable()
export class EstimateUseCase {
  constructor(
    private readonly repository: ServiceOrdersRepositoryInterface,
    @Inject(PART_REPOSITORY) private readonly partRepository: PartRepository,
    @Optional()
    @Inject(SERVICE_CATALOG_REPOSITORY)
    private readonly serviceCatalogRepository?: ServiceCatalogRepository,
  ) {}

  async createEstimate(orderId: string) {
    const data = await this.repository.findById(orderId);
    if (!data)
      throw new NotFoundException(`Service order ${orderId} not found`);

    const order = ServiceOrderMapper.toDomain(data);
    try {
      const change = order.requestApproval();

      const [estimate] = await Promise.all([
        this.repository.createEstimate({
          serviceOrderId: orderId,
          status: EstimateStatus.PENDING,
          totalAmount: 0,
        }),
        this.repository.updateStatus(orderId, change.newStatus),
      ]);

      await this.repository.createStatusHistory({
        serviceOrderId: orderId,
        previousStatus: change.previousStatus,
        newStatus: change.newStatus,
        changedBy: 'system',
        notes: 'Estimate generated',
      });

      return plainToInstance(EstimateResponseDto, estimate, {
        excludeExtraneousValues: true,
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  async addEstimateItem(estimateId: string, dto: AddEstimateItemDto) {
    let unitPriceMoney: Money | null = null;
    let description = dto.description ?? '';

    if (dto.itemType === 'SERVICE') {
      if (this.serviceCatalogRepository) {
        const service = await this.serviceCatalogRepository.findById(
          dto.referenceId,
        );

        if (!service) {
          throw new NotFoundException('Service not found in catalog');
        }

        unitPriceMoney = Money.fromFloat(service.price);
      } else {
        unitPriceMoney = Money.fromFloat(0);
      }
    } else {
      const part = await this.partRepository.findById(dto.referenceId);

      if (!part) {
        throw new NotFoundException('Part not found');
      }

      if (part.stockQuantity < dto.quantity) {
        throw new ConflictException(
          `Insufficient stock for part ${part.name}. Available: ${part.stockQuantity}`,
        );
      }

      unitPriceMoney = Money.fromFloat(part.price);
      description = dto.description ?? part.name;

      try {
        await this.partRepository.decrementStock(part.id, dto.quantity);
      } catch (error: unknown) {
        if (error instanceof InsufficientMaterialStockException) {
          throw new ConflictException(error.message);
        }

        if (error instanceof DomainException) {
          throw new BadRequestException(error.message);
        }

        throw error;
      }
    }

    const totalPriceMoney = unitPriceMoney.multiply(dto.quantity);

    const item = await this.repository.addEstimateItem({
      estimateId,
      itemType: dto.itemType,
      referenceId: dto.referenceId,
      description: dto.description ?? description,
      quantity: dto.quantity,
      unitPrice: unitPriceMoney.float,
      totalPrice: totalPriceMoney.float,
    });

    return plainToInstance(EstimateItemDto, item, {
      excludeExtraneousValues: true,
    });
  }

  async updateEstimateStatus(estimateId: string, dto: UpdateEstimateStatusDto) {
    if (dto.status === EstimateStatus.APPROVED) {
      const estimate = await this.repository.updateEstimateStatus(
        estimateId,
        dto.status,
        new Date(),
      );

      const data = await this.repository.findById(estimate.serviceOrderId);
      if (!data) throw new NotFoundException('Service order not found');

      const order = ServiceOrderMapper.toDomain(data);
      try {
        const change = order.startService();

        await this.repository.updateStatus(order.id, change.newStatus);
        await this.repository.createStatusHistory({
          serviceOrderId: order.id,
          previousStatus: change.previousStatus,
          newStatus: change.newStatus,
        });
      } catch (error: unknown) {
        if (error instanceof Error) {
          throw new BadRequestException(error.message);
        }
        throw error;
      }

      return plainToInstance(EstimateResponseDto, estimate, {
        excludeExtraneousValues: true,
      });
    }

    const estimate = await this.repository.updateEstimateStatus(
      estimateId,
      dto.status,
    );
    return plainToInstance(EstimateResponseDto, estimate, {
      excludeExtraneousValues: true,
    });
  }

  async rejectEstimate(id: string, dto: RejectEstimateDto) {
    const data = await this.repository.findById(id);
    if (!data) throw new NotFoundException(`Service order ${id} not found`);

    const order = ServiceOrderMapper.toDomain(data);
    try {
      const change = order.rejectEstimate();

      const updated = await this.repository.updateStatus(id, change.newStatus);

      await this.repository.createStatusHistory({
        serviceOrderId: id,
        previousStatus: change.previousStatus,
        newStatus: change.newStatus,
        notes: dto.reason,
      });

      return plainToInstance(ServiceOrderResponseDto, updated, {
        excludeExtraneousValues: true,
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }
}
