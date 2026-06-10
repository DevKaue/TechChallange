import { UnauthorizedException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  const originalJwtSecret = process.env.JWT_SECRET;
  let prisma: {
    user: {
      findUnique: jest.Mock;
    };
  };
  let strategy: JwtStrategy;

  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret';
    prisma = {
      user: {
        findUnique: jest.fn(),
      },
    };
    strategy = new JwtStrategy(prisma as unknown as PrismaService);
  });

  afterAll(() => {
    process.env.JWT_SECRET = originalJwtSecret;
  });

  it('should resolve the authenticated user from the token subject', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      name: 'Ana Santos',
      email: 'ana.santos@oficina.com',
      role: UserRole.ATTENDANT,
    });

    await expect(
      strategy.validate({ sub: 'user-1', role: UserRole.ATTENDANT }),
    ).resolves.toEqual({
      userId: 'user-1',
      name: 'Ana Santos',
      email: 'ana.santos@oficina.com',
      role: UserRole.ATTENDANT,
    });
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      select: { id: true, name: true, email: true, role: true },
    });
  });

  it('should reject a token without subject', async () => {
    await expect(strategy.validate({})).rejects.toThrow(UnauthorizedException);
  });

  it('should reject a token for a missing user', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(strategy.validate({ sub: 'missing-user' })).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
