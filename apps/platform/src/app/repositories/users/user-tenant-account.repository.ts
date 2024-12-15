import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TenantTrackedTypeormRepository as BaseRepository } from '@aiofc/typeorm';
import { UserTenantAccount } from '@aiofc/entities';
import { InjectDataSource } from '@aiofc/nestjs-typeorm';
import { ClsService } from '@aiofc/nestjs-cls';
import { TenantClsStore } from '@aiofc/persistence-base';

@Injectable()
export class UserTenantAccountRepository extends BaseRepository<
  UserTenantAccount,
  'id'
> {
  constructor(
    @InjectDataSource()
    ds: DataSource,
    clsService: ClsService<TenantClsStore>
  ) {
    super(UserTenantAccount, ds, 'id', clsService);
  }

  public async hasAnyPermission(
    tenantId: string,
    userProfileId: string,
    permissions: string[]
  ): Promise<boolean> {
    return (
      this.getBaseUserTenantAccountSelectQueryBuilder(tenantId, userProfileId)
        .andWhere('LOWER(permission.action) IN (:...permissions)', {
          permissions,
        })
        .limit(1)
        // .cache(15 * 1000)
        .getCount()
        .then((count) => count > 0)
    );
  }

  public hasEachPermission(
    tenantId: string,
    userProfileId: string,
    permissions: string[]
  ): Promise<boolean> {
    let queryBuilder = this.getBaseUserTenantAccountSelectQueryBuilder(
      tenantId,
      userProfileId
    );

    for (const permission of permissions) {
      queryBuilder = queryBuilder.andWhere(
        'LOWER(permission.action) = :permission',
        {
          permission,
        }
      );
    }
    return (
      queryBuilder
        .limit(1)
        // .cache(15 * 1000)
        .getCount()
        .then((count) => count > 0)
    );
  }

  private getBaseUserTenantAccountSelectQueryBuilder(
    tenantId: string,
    userProfileId: string
  ) {
    return this.createQueryBuilder('user')
      .innerJoin('user.roles', 'role')
      .innerJoin('role.permissions', 'permission')
      .where('user.userProfileId = :userProfileId', { userProfileId })
      .andWhere('user.tenantId = :tenantId', { tenantId });
  }
}
