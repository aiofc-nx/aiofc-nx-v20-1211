import { UserTenantAccount } from '@aiofc/entities';
import { Injectable } from '@nestjs/common';
import { UserTenantAccountRepository } from '../../repositories/users/user-tenant-account.repository';
import { BaseEntityService } from '@aiofc/service-base';

@Injectable()
export class UserTenantAccountService extends BaseEntityService<
  UserTenantAccount,
  'id',
  UserTenantAccountRepository
> {
  constructor(repository: UserTenantAccountRepository) {
    super(repository);
  }

  public hasAnyPermission(
    tenantId: string,
    userProfileId: string,
    permissions: string[]
  ): Promise<boolean> {
    const normalizedPermissions = permissions.map((p) =>
      p.toLowerCase().trim()
    );

    return this.repository.hasAnyPermission(
      tenantId,
      userProfileId,
      normalizedPermissions
    );
  }

  public hasEachPermission(
    tenantId: string,
    userProfileId: string,
    permissions: string[]
  ): Promise<boolean> {
    const normalizedPermissions = permissions.map((p) =>
      p.toLowerCase().trim()
    );

    return this.repository.hasEachPermission(
      tenantId,
      userProfileId,
      normalizedPermissions
    );
  }
}
