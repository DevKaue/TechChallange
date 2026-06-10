import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { AuthService } from './auth.service';
import { hashPassword } from './password-hasher';

describe('AuthService', () => {
  let authService: AuthService;
  let jwtService: jest.Mocked<Pick<JwtService, 'sign'>>;
  let prisma: {
    user: {
      findUnique: jest.Mock;
    };
  };

  beforeEach(() => {
    jwtService = {
      sign: jest.fn().mockReturnValue('signed-token'),
    };
    prisma = {
      user: {
        findUnique: jest.fn(),
      },
    };

    authService = new AuthService(
      jwtService as jest.Mocked<JwtService>,
      prisma as unknown as PrismaService,
    );
  });

  it('should authenticate an internal user and return a JWT', async () => {
    const passwordHash = await hashPassword('Tech@123');
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      name: 'Ana Santos',
      email: 'ana.santos@oficina.com',
      role: UserRole.ATTENDANT,
      passwordHash,
    });

    const result = await authService.login({
      email: 'ANA.SANTOS@OFICINA.COM',
      password: 'Tech@123',
    });

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'ana.santos@oficina.com' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        passwordHash: true,
      },
    });
    expect(jwtService.sign).toHaveBeenCalledWith({
      sub: 'user-1',
      email: 'ana.santos@oficina.com',
      role: UserRole.ATTENDANT,
    });
    expect(result).toEqual({
      access_token: 'signed-token',
      token_type: 'Bearer',
      expires_in: 3600,
      user: {
        id: 'user-1',
        name: 'Ana Santos',
        email: 'ana.santos@oficina.com',
        role: UserRole.ATTENDANT,
      },
    });
  });

  it('should reject an unknown email', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(
      authService.login({
        email: 'missing@oficina.com',
        password: 'Tech@123',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should reject an invalid password', async () => {
    const passwordHash = await hashPassword('Tech@123');
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      name: 'Ana Santos',
      email: 'ana.santos@oficina.com',
      role: UserRole.ATTENDANT,
      passwordHash,
    });

    await expect(
      authService.login({
        email: 'ana.santos@oficina.com',
        password: 'Wrong@123',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
