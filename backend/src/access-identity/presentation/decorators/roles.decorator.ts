import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../domain/enums/user-role.enum';

export const ROLES_KEY = 'roles';

/**
 * Marca um handler/controller como restrito aos papéis informados.
 * Deve ser usado em conjunto com o RolesGuard.
 *
 * Ex.: @Roles(UserRole.ATTENDANT)
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
