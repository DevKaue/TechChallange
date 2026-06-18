import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ServiceOrdersRepositoryInterface } from '@service-orders/domain/contracts/service-orders-repository.interface';
import { ServiceOrderMapper } from '@service-orders/domain/mappers/service-order.mapper';
import { StartDiagnosisDto } from '@service-orders/application/dto/diagnosis/start-diagnosis.dto';
import { ServiceOrderResponseDto } from '@service-orders/application/dto/service-order/service-order-response.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class DiagnosisUseCase {
  constructor(private readonly repository: ServiceOrdersRepositoryInterface) {}

  async startDiagnosis(id: string, dto: StartDiagnosisDto) {
    const data = await this.repository.findById(id);
    if (!data) throw new NotFoundException(`Service order ${id} not found`);

    const order = ServiceOrderMapper.toDomain(data);
    try {
      const change = order.startDiagnosis();

      const updated = await this.repository.updateStatus(id, change.newStatus);
      await this.repository.createStatusHistory({
        serviceOrderId: id,
        previousStatus: change.previousStatus,
        newStatus: change.newStatus,
        notes: dto.diagnosis,
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
