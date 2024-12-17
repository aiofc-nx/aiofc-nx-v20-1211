import { Injectable } from '@nestjs/common';
import { AbstractAccessCheckService, UserClsStore } from '@aiofc/auth';
import { Transactional } from 'typeorm-transactional';
import { UserTenantAccountService } from '../users/user-tenant-account.service';
import { AccessTokenPayload } from '../../../common/vo/token-payload';
import { ClsService } from '@aiofc/nestjs-cls';

@Injectable()
export class AccessCheckService extends AbstractAccessCheckService<AccessTokenPayload> {
  constructor(
    private userRolesService: UserTenantAccountService,
    private clsService: ClsService<UserClsStore<AccessTokenPayload>>
  ) {
    super();
  }

  @Transactional()
  public hasEach(permissions: string[] | string): Promise<boolean> {
    const { userId, tenantId } = this.clsService.get();

    return this.userRolesService.hasEachPermission(
      tenantId,
      userId,
      Array.isArray(permissions) ? permissions : [permissions]
    );
  }

  @Transactional()
  public hasAny(permissions: string[]): Promise<boolean> {
    const { userId, tenantId } = this.clsService.get();

    return this.userRolesService.hasAnyPermission(
      tenantId,
      userId,
      permissions
    );
  }
}
