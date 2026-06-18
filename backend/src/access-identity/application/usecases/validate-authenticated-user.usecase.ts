import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { ACCESS_IDENTITY_REPOSITORY } from '../../domain/contracts/access-identity-repository.interface';
import type { AccessIdentityRepository } from '../../domain/contracts/access-identity-repository.interface';
import { AuthenticatedUser } from '../../domain/entities/authenticated-user.entity';

export type ValidateAuthenticatedUserInput = {
  sub?: string;
  email?: string;
  role?: UserRole;
};

@Injectable()
export class ValidateAuthenticatedUserUseCase {
  constructor(
    @Inject(ACCESS_IDENTITY_REPOSITORY)
    private readonly accessIdentityRepository: AccessIdentityRepository,
  ) {}

  async execute(
    payload: ValidateAuthenticatedUserInput,
  ): Promise<AuthenticatedUser> {
    if (!payload.sub) {
      throw new UnauthorizedException();
    }

    const user = await this.accessIdentityRepository.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException();
    }

    return user.toAuthenticatedUser();
  }
}
