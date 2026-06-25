import { Injectable } from '@nestjs/common';
import { ServiceOrdersRepositoryInterface } from '@service-orders/domain/contracts/service-orders-repository.interface';
// TODO: Descomente quando access-identity module estiver pronto
// import { USER_REPOSITORY } from '@service-orders/domain/acls/user-repository.interface';
// import type { UserRepository } from '@service-orders/domain/acls/user-repository.interface';
import { MechanicAssignment } from '@service-orders/domain/value-objects/mechanic-assignment.value-object';
import { UserRole } from '@service-orders/domain/enums/user-role.enum';
import { AssignMechanicDto } from '@service-orders/application/dto/mechanic/assign-mechanic.dto';
import { ServiceOrderResponseDto } from '@service-orders/application/dto/service-order/service-order-response.dto';
import { plainToInstance } from 'class-transformer';
import { ServiceOrderNotFoundException } from '@service-orders/application/exceptions/service-order-not-found.exception';
import { InvalidStatusTransitionException } from '@service-orders/application/exceptions/invalid-status-transition.exception';
import { ServiceOrderMapper } from '@service-orders/domain/mappers/service-order.mapper';

@Injectable()
export class MechanicUseCase {
  constructor(
    private readonly repository: ServiceOrdersRepositoryInterface,
    // TODO: Descomente quando access-identity module estiver pronto
    // @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
  ) {}

  async assignMechanic(id: string, dto: AssignMechanicDto) {
    const data = await this.repository.findById(id);
    if (!data) throw new ServiceOrderNotFoundException(id);

    const order = ServiceOrderMapper.toDomain(data);

    // TODO: Descomente quando access-identity module estiver pronto
    // const user = await this.userRepository.findById(dto.mechanicId);
    // if (!user) throw new NotFoundException('User not found');

    try {
      const assignment = MechanicAssignment.create(
        dto.mechanicId,
        '',
        UserRole.MECHANIC,
      );
      order.assignMechanic(assignment);
    } catch (error: unknown) {
      throw new InvalidStatusTransitionException(
        error instanceof Error ? error.message : 'Unexpected error',
      );
    }

    const updated = await this.repository.update(
      id,
      ServiceOrderMapper.toPersistence(order),
    );
    return plainToInstance(ServiceOrderResponseDto, updated, {
      excludeExtraneousValues: true,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async updateMechanicAvailability(mechanicId: string, available: boolean) {
    // TODO: Descomente quando access-identity module estiver pronto
    // await this.userRepository.updateAvailability(mechanicId, available);
  }
}
