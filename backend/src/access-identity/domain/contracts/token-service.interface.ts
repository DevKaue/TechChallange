import { UserRole } from '@prisma/client';

export const TOKEN_SERVICE = Symbol('TOKEN_SERVICE');

export type AccessTokenPayload = {
  sub: string;
  email: string;
  role: UserRole;
};

export interface TokenService {
  sign(payload: AccessTokenPayload): string;
}
