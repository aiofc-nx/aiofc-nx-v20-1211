import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TenantTrackedTypeormRepository as BaseRepository } from '@aiofc/typeorm-base';
import { UserTenantAccount } from '@aiofc/entities';
import { InjectDataSource } from '@aiofc/nestjs-typeorm';
import { ClsService } from '@aiofc/nestjs-cls';
import { TenantClsStore } from '@aiofc/persistence-base';

/**
 * 用户租户账号仓储类
 * 处理用户在特定租户下的账号信息和权限验证
 */
@Injectable()
export class UserTenantAccountRepository extends BaseRepository<
  UserTenantAccount,
  'id'
> {
  /**
   * 构造函数
   * @param ds - 数据源连接
   * @param clsService - 租户上下文服务
   */
  constructor(
    @InjectDataSource()
    ds: DataSource,
    clsService: ClsService<TenantClsStore>
  ) {
    super(UserTenantAccount, ds, 'id', clsService);
  }

  /**
   * 检查用户是否拥有指定权限列表中的任意一个权限
   * @param tenantId - 租户ID
   * @param userProfileId - 用户档案ID
   * @param permissions - 待检查的权限列表
   * @returns 如果用户拥有任意一个指定权限则返回true，否则返回false
   */
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

  /**
   * 检查用户是否同时拥有指定权限列表中的所有权限
   * @param tenantId - 租户ID
   * @param userProfileId - 用户档案ID
   * @param permissions - 待检查的权限列表
   * @returns 如果用户拥有所有指定权限则返回true，否则返回false
   */
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

  /**
   * 获取基础的用户租户账号查询构建器
   * 该查询构建器包含了用户-角色-权限的关联查询
   * @param tenantId - 租户ID
   * @param userProfileId - 用户档案ID
   * @returns TypeORM查询构建器实例
   */
  private getBaseUserTenantAccountSelectQueryBuilder(
    tenantId: string,
    userProfileId: string
  ) {
    return this.typeormRepository
      .createQueryBuilder('user')
      .innerJoin('user.roles', 'role')
      .innerJoin('role.permissions', 'permission')
      .where('user.userProfileId = :userProfileId', { userProfileId })
      .andWhere('user.tenantId = :tenantId', { tenantId });
  }
}
