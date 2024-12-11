import { Controller, Get } from '@nestjs/common';
import { RoleType } from './vo/role-type';
import { Roles, SkipAuth, Permissions } from '@aiofc/auth';

@Controller('roles')
export class RolesController {
  constructor() {}

  @Get('admin-only')
  @Roles<RoleType>(RoleType.ADMIN)
  async adminOnly() {
    return 'hello';
  }

  @Get('admin-or-regular')
  @Roles<RoleType>([RoleType.ADMIN, RoleType.REGULAR])
  async adminOrRegular() {
    return 'hello';
  }

  @Get('admin-or-permissions')
  @Permissions(['admin.user.create', 'admin.user.update'])
  @Roles<RoleType>(RoleType.ADMIN)
  async adminOrPermission() {
    return 'hello';
  }

  @SkipAuth()
  @Get('skip-auth-and-roles')
  @Roles<RoleType>(RoleType.ADMIN)
  async anyMatch() {
    return 'hello';
  }
}
