import { Injectable, Logger } from '@nestjs/common';
import { Transactional } from 'typeorm-transactional';
import { TenantsRepository } from '../../repositories/tenants/tenants.repository';
import { BaseEntityService } from '@aiofc/service-base';
import { Tenant, TenantStatus, UserProfile } from '@aiofc/entities';
import { ConflictEntityCreationException } from '@aiofc/exceptions';
import { TenantTrackedTypeormBaseEntity } from '@aiofc/typeorm-base';
import { FindOptionsWhere } from 'typeorm';

/**
 * 租户服务类
 *
 * 继承自BaseEntityService基础服务类,用于处理租户相关的业务逻辑
 * 泛型参数说明:
 * - Tenant: 租户实体类型
 * - 'id': ID字段名
 * - TenantsRepository: 租户仓储类型
 */
@Injectable()
export class TenantService extends BaseEntityService<
  Tenant,
  'id',
  TenantsRepository
> {
  private readonly logger = new Logger(TenantService.name);

  /**
   * 构造函数
   * @param tenantsRepository - 租户仓储实例
   */
  constructor(tenantsRepository: TenantsRepository) {
    super(tenantsRepository);
  }

  /**
   * 设置租户
   *
   * 该方法用于创建新租户,包含以下步骤:
   * 1. 检查租户标识符是否已存在
   * 2. 如果存在则抛出冲突异常
   * 3. 创建新租户记录
   * 4. 记录创建日志
   *
   * @param tenantName - 租户名称
   * @param tenantFriendlyIdentifier - 租户友好标识符
   * @param owner - 租户所有者(用户)
   * @returns 返回创建的租户实体
   * @throws ConflictEntityCreationException - 当租户标识符已存在时抛出
   */
  @Transactional()
  async setupTenant(
    tenantName: string,
    tenantFriendlyIdentifier: string,
    owner: UserProfile
  ) {
    // 构造查询条件,检查租户标识符是否已存在
    const where: FindOptionsWhere<Tenant> = {
      tenantFriendlyIdentifier,
    };
    const numberOfTenantsByIdentifier = await this.repository.count(where);

    // 如果标识符已存在,抛出冲突异常
    if (numberOfTenantsByIdentifier > 0) {
      throw new ConflictEntityCreationException(
        'Tenant',
        'tenantFriendlyIdentifier',
        tenantFriendlyIdentifier
      );
    }

    // 创建新租户
    // 使用类型断言确保类型安全:
    // - 排除id和继承的基础字段
    // - id字段设为可选
    const tenant = await this.repository.create({
      tenantName,
      tenantFriendlyIdentifier,
      tenantStatus: TenantStatus.ACTIVE,
      owner,
    } as Omit<Tenant, 'id' | keyof TenantTrackedTypeormBaseEntity> & Partial<Pick<Tenant, 'id'>>);

    // 记录创建日志
    this.logger.log(`Tenant ${tenantName} created with id ${tenant.id}`);

    return tenant;
  }
}
