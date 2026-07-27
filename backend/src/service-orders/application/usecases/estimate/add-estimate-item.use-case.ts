import {
  Injectable,
  Inject,
  Optional,
  ConflictException,
} from '@nestjs/common';
import { ServiceOrdersRepositoryInterface } from '@service-orders/domain/contracts/service-orders-repository.interface';
import { PART_REPOSITORY } from '@service-orders/domain/acls/part-repository.interface';
import type { PartRepository } from '@service-orders/domain/acls/part-repository.interface';
import { SERVICE_CATALOG_REPOSITORY } from '@service-orders/domain/acls/service-catalog-repository.interface';
import type { ServiceCatalogRepository } from '@service-orders/domain/acls/service-catalog-repository.interface';
import { Money } from '@service-orders/domain/value-objects/money.value-object';
import { EstimateItemDto } from '@service-orders/application/dto/estimate/estimate-response.dto';
import { AddEstimateItemDto } from '@service-orders/application/dto/estimate/add-estimate-item.dto';
import { plainToInstance } from 'class-transformer';
import { ServiceCatalogNotFoundException } from '@service-orders/application/exceptions/service-catalog-not-found.exception';
import { PartNotFoundException } from '@service-orders/application/exceptions/part-not-found.exception';
import { InvalidMaterialDataException } from '@service-orders/application/exceptions/invalid-material-data.exception';
import InsufficientMaterialStockException from '@materials/domain/exceptions/insufficient-material-stock.exception';
import DomainException from '@materials/domain/exceptions/domain.exception';
import { ServiceOrderItemType } from '@service-orders/domain/enums/service-order-item-type.enum';

@Injectable()
export class AddEstimateItemUseCase {
  constructor(
    private readonly repository: ServiceOrdersRepositoryInterface,
    @Inject(PART_REPOSITORY) private readonly partRepository: PartRepository,
    @Optional()
    @Inject(SERVICE_CATALOG_REPOSITORY)
    private readonly serviceCatalogRepository?: ServiceCatalogRepository,
  ) {}

  async execute(estimateId: string, dto: AddEstimateItemDto) {
    let unitPriceMoney: Money | null = null;
    let description = dto.description ?? '';

    if (dto.itemType === ServiceOrderItemType.SERVICE) {
      if (this.serviceCatalogRepository) {
        const service = await this.serviceCatalogRepository.findById(
          dto.referenceId,
        );

        if (!service) {
          throw new ServiceCatalogNotFoundException(dto.referenceId);
        }

        unitPriceMoney = Money.fromFloat(service.price);
      } else {
        unitPriceMoney = Money.fromFloat(0);
      }
    } else {
      const part = await this.partRepository.findById(dto.referenceId);

      if (!part) {
        throw new PartNotFoundException(dto.referenceId);
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
          throw new InvalidMaterialDataException(error.message);
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

    await this.repository.recalcEstimateTotal(estimateId);

    return plainToInstance(EstimateItemDto, item, {
      excludeExtraneousValues: true,
    });
  }
}