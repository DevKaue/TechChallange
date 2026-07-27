import { Inject, Injectable } from '@nestjs/common';
import { USER_REPOSITORY } from '@service-orders/domain/acls/user-repository.interface';
import type { UserRepository } from '@service-orders/domain/acls/user-repository.interface';

@Injectable()
export class UpdateMechanicAvailabilityUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
  ) {}

  async execute(mechanicId: string, available: boolean): Promise<void> {
    await this.userRepository.updateAvailability(mechanicId, available);
  }
}