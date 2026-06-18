import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { ServiceOrdersRepositoryInterface } from '@service-orders/domain/contracts/service-orders-repository.interface';
import { USER_REPOSITORY } from '@service-orders/domain/acls/user-repository.interface';
import type { UserRepository } from '@service-orders/domain/acls/user-repository.interface';
import { UserRole } from '@service-orders/domain/enums/user-role.enum';
import { MechanicAssignment } from '@service-orders/domain/value-objects/mechanic-assignment.value-object';
import { AssignMechanicDto } from '@service-orders/application/dto/mechanic/assign-mechanic.dto';
import { ServiceOrderMapper } from '@service-orders/domain/mappers/service-order.mapper';
import { ServiceOrderResponseDto } from '@service-orders/application/dto/service-order/service-order-response.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class MechanicUseCase {
  constructor(
    private readonly repository: ServiceOrdersRepositoryInterface,
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
  ) {}

  async assignMechanic(id: string, dto: AssignMechanicDto) {
    const data = await this.repository.findById(id);
    if (!data) throw new NotFoundException(`Service order ${id} not found`);

    const user = await this.userRepository.findById(dto.mechanicId);
    if (!user) throw new NotFoundException('User not found');

    const order = ServiceOrderMapper.toDomain(data);
    try {
      const assignment = MechanicAssignment.create(
        user.id,
        user.name,
        user.role as UserRole,
      );
      order.assignMechanic(assignment);
    } catch (error: unknown) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Unexpected error',
      );
    }

    const updated = await this.repository.assignMechanic(id, dto.mechanicId);
    return plainToInstance(ServiceOrderResponseDto, updated, {
      excludeExtraneousValues: true,
    });
  }

  async updateMechanicAvailability(mechanicId: string, available: boolean) {
    await this.userRepository.updateAvailability(mechanicId, available);
  }
}
