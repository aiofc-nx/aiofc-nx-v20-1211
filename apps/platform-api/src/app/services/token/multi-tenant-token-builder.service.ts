import { AbstractTokenBuilderService } from '@aiofc/auth';
import {
  MultiTenantAccessTokenPayload,
  RefreshTokenPayload,
} from '../../../common/vo/token-payload';
import { UserProfile } from '@aiofc/entities';

export class MultiTenantTokenBuilderService extends AbstractTokenBuilderService<
  UserProfile,
  MultiTenantAccessTokenPayload,
  RefreshTokenPayload
> {
  override buildAccessTokenPayload(
    user: UserProfile
  ): MultiTenantAccessTokenPayload {
    return {
      sub: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      tenants: (user.userTenantsAccounts || []).map((tenantAccount) => ({
        tenantId: tenantAccount.tenantId,
        roles: tenantAccount.roles?.map((role) => ({
          roleId: role.id,
          roleType: role.roleType,
        })),
      })),
    };
  }

  override buildRefreshTokenPayload(user: UserProfile): RefreshTokenPayload {
    return {
      sub: user.id,
      email: user.email,
    };
  }
}
