import { UserRole } from '@prisma/client';

export interface AuthenticatedUser {
  userId: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface RequestWithUser {
  user: AuthenticatedUser;
}
