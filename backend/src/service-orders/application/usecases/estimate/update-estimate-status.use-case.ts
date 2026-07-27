import { Injectable } from '@nestjs/common';
import { ServiceOrdersRepositoryInterface } from '@service-orders/domain/contracts/service-orders-repository.interface';
import { ServiceOrderMapper } from '@service-orders/domain/mappers/service-order.mapper';
import { EstimateStatus } from '@service-orders/domain/enums/estimate-status.enum';
import { EstimateResponseDto } from '@service-orders/application/dto/estimate/estimate-response.dto';
import { UpdateEstimateStatusDto } from '@service-orders/application/dto/estimate/update-estimate-status.dto';
import { plainToInstance } from 'class-transformer';
import { ServiceOrderNotFoundException } from '@service-orders/application/exceptions/service-order-not-found.exception';
import { InvalidStatusTransitionException } from '@service-orders/application/exceptions/invalid-status-transition.exception';

@Injectable()
export class UpdateEstimateStatusUseCase {
  constructor(
    private readonly repository: ServiceOrdersRepositoryInterface,
  ) {}

  async execute(estimateId: string, dto: UpdateEstimateStatusDto) {
    if (dto.status === EstimateStatus.APPROVED) {
      const estimate = await this.repository.updateEstimateStatus(
        estimateId,
        dto.status,
        new Date(),
      );

      const data = await this.repository.findById(estimate.serviceOrderId);
      if (!data) {
        throw new ServiceOrderNotFoundException('Service order not found');
      }

      const order = ServiceOrderMapper.toDomain(data);
      try {
        const change = order.startService();

        await this.repository.update(order.id, order);
        await this.repository.createStatusHistory({
          serviceOrderId: order.id,
          previousStatus: change.previousStatus,
          newStatus: change.newStatus,
        });
      } catch (error: unknown) {
        throw new InvalidStatusTransitionException(
          error instanceof Error ? error.message : 'Unexpected error',
        );
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
}