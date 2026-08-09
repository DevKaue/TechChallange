import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaService } from '@/common/infra/prisma/prisma.service';
import { USER_REPOSITORY } from '@service-orders/domain/acls/user-repository.interface';
import { LoginUseCase } from './application/usecases/login.usecase';
import { ValidateAuthenticatedUserUseCase } from './application/usecases/validate-authenticated-user.usecase';
import { ACCESS_IDENTITY_REPOSITORY } from './domain/contracts/access-identity-repository.interface';
import type { AccessIdentityRepository } from './domain/contracts/access-identity-repository.interface';
import {
  PASSWORD_HASHER,
  PasswordHasher,
} from './domain/contracts/password-hasher.interface';
import {
  TOKEN_SERVICE,
  TokenService,
} from './domain/contracts/token-service.interface';
import { PrismaAccessIdentityRepository } from './infra/repositories/prisma-access-identity.repository';
import { JwtTokenService } from './infra/security/jwt-token.service';
import { ScryptPasswordHasher } from './infra/security/scrypt-password-hasher';
import { AuthController } from './presentation/controllers/auth.controller';
import { JwtAuthGuard } from './infra/guards/jwt-auth.guard';
import { RolesGuard } from './infra/guards/roles.guard';
import { JwtStrategy } from './presentation/strategies/jwt.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [
    {
      provide: LoginUseCase,
      useFactory: (
        accessIdentityRepository: AccessIdentityRepository,
        passwordHasher: PasswordHasher,
        tokenService: TokenService,
      ) =>
        new LoginUseCase(
          accessIdentityRepository,
          passwordHasher,
          tokenService,
        ),
      inject: [ACCESS_IDENTITY_REPOSITORY, PASSWORD_HASHER, TOKEN_SERVICE],
    },
    {
      provide: ValidateAuthenticatedUserUseCase,
      useFactory: (accessIdentityRepository: AccessIdentityRepository) =>
        new ValidateAuthenticatedUserUseCase(accessIdentityRepository),
      inject: [ACCESS_IDENTITY_REPOSITORY],
    },
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
    {
      provide: ACCESS_IDENTITY_REPOSITORY,
      useClass: PrismaAccessIdentityRepository,
    },
    {
      provide: PASSWORD_HASHER,
      useClass: ScryptPasswordHasher,
    },
    {
      provide: TOKEN_SERVICE,
      useClass: JwtTokenService,
    },

    // ACL adapter exposto para service-orders (validação/atribuição de mecânico).
    {
      provide: USER_REPOSITORY,
      useFactory: (
        repository: AccessIdentityRepository,
        prisma: PrismaService,
      ) => ({
        findById: async (id: string) => {
          const user = await repository.findById(id);
          return user
            ? {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
              }
            : null;
        },
        updateAvailability: async (userId: string, available: boolean) => {
          await prisma.user.update({
            where: { id: userId },
            data: { available },
          });
        },
      }),
      inject: [ACCESS_IDENTITY_REPOSITORY, PrismaService],
    },
  ],
  controllers: [AuthController],
  exports: [JwtAuthGuard, RolesGuard, USER_REPOSITORY],
})
export class AccessIdentityModule {}
