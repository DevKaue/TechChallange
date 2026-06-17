import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { ACCESS_IDENTITY_REPOSITORY } from '../../domain/contracts/access-identity-repository.interface';
import type { AccessIdentityRepository } from '../../domain/contracts/access-identity-repository.interface';
import { PASSWORD_HASHER } from '../../domain/contracts/password-hasher.interface';
import type { PasswordHasher } from '../../domain/contracts/password-hasher.interface';
import { TOKEN_SERVICE } from '../../domain/contracts/token-service.interface';
import type { TokenService } from '../../domain/contracts/token-service.interface';

export const tokenExpiresInSeconds = 60 * 60;

export type LoginUseCaseInput = {
  email: string;
  password: string;
};

export type LoginUseCaseOutput = {
  access_token: string;
  token_type: 'Bearer';
  expires_in: number;
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
};

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(ACCESS_IDENTITY_REPOSITORY)
    private readonly accessIdentityRepository: AccessIdentityRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,
    @Inject(TOKEN_SERVICE)
    private readonly tokenService: TokenService,
  ) {}

  async execute(input: LoginUseCaseInput): Promise<LoginUseCaseOutput> {
    const email = input.email.trim().toLowerCase();
    const user = await this.accessIdentityRepository.findByEmail(email);

    if (!user?.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.passwordHasher.verify(
      input.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      access_token: this.tokenService.sign({
        sub: user.id,
        email: user.email,
        role: user.role,
      }),
      token_type: 'Bearer',
      expires_in: tokenExpiresInSeconds,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}
