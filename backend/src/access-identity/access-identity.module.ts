import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { LoginUseCase } from './application/usecases/login.usecase';
import { ValidateAuthenticatedUserUseCase } from './application/usecases/validate-authenticated-user.usecase';
import { ACCESS_IDENTITY_REPOSITORY } from './domain/contracts/access-identity-repository.interface';
import { PASSWORD_HASHER } from './domain/contracts/password-hasher.interface';
import { TOKEN_SERVICE } from './domain/contracts/token-service.interface';
import { PrismaAccessIdentityRepository } from './infra/repositories/prisma-access-identity.repository';
import { JwtTokenService } from './infra/security/jwt-token.service';
import { ScryptPasswordHasher } from './infra/security/scrypt-password-hasher';
import { AuthController } from './presentation/controllers/auth.controller';
import { JwtAuthGuard } from './presentation/guards/jwt-auth.guard';
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
    LoginUseCase,
    ValidateAuthenticatedUserUseCase,
    JwtStrategy,
    JwtAuthGuard,
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
  ],
  controllers: [AuthController],
  exports: [JwtAuthGuard],
})
export class AccessIdentityModule {}
