import { DataSource, FindOptionsWhere } from 'typeorm';
import { GeneralInternalServerException } from '@aiofc/exceptions';
import { TrackedTypeormRepository } from './tracked-typeorm-repository';
import { ObjectType } from 'typeorm/common/ObjectType';
import { TenantTrackedTypeormBaseEntity } from '../entity/tenant-tracked-typeorm-base-entity';
import { TenantClsStore } from '@aiofc/persistence-base';
import { ClsService } from '@aiofc/nestjs-cls';

/**
 * 租户可追踪的TypeORM仓储抽象类
 *
 * 该类通过继承和实现来组合功能:
 * 1. 继承TrackedTypeormRepository:
 *    - 获得基础的可追踪仓储功能
 * 2. 添加租户相关功能:
 *    - 自动注入租户ID到查询条件中
 *    - 租户隔离的数据访问控制
 *
 * 泛型参数说明:
 * - ENTITY: 实体类型,必须继承自TenantTrackedTypeormBaseEntity
 * - ID: 实体ID字段类型,必须是ENTITY的键名
 * - FIELDS_REQUIRED_FOR_UPDATE: 更新时必需的字段,默认为ID
 * - AUTO_GENERATED_FIELDS: 自动生成的字段,包含基础字段、ID和tenantId
 */
export abstract class TenantTrackedTypeormRepository<
  ENTITY extends TenantTrackedTypeormBaseEntity,
  ID extends keyof ENTITY,
  FIELDS_REQUIRED_FOR_UPDATE extends keyof ENTITY = ID,
  AUTO_GENERATED_FIELDS extends keyof ENTITY =
    | keyof TenantTrackedTypeormBaseEntity
    | ID
    | 'tenantId',
> extends TrackedTypeormRepository<
  ENTITY,
  ID,
  FIELDS_REQUIRED_FOR_UPDATE,
  AUTO_GENERATED_FIELDS
> {
  /**
   * 构造函数
   * @param et - 实体类
   * @param dataSource - 数据源
   * @param idFieldName - ID字段名
   * @param clsService - CLS服务,用于获取租户上下文
   */
  protected constructor(
    et: ObjectType<ENTITY>,
    dataSource: DataSource,
    idFieldName: ID,
    protected clsService: ClsService<TenantClsStore>,
  ) {
    super(et, dataSource, idFieldName);
  }

  /**
   * 重写预处理查询条件方法
   *
   * 该方法在查询条件中注入租户ID:
   * 1. 调用父类的presetWhereOptions预处理条件
   * 2. 从CLS中获取当前租户ID
   * 3. 将租户ID添加到查询条件中
   *
   * 实现细节:
   * - 支持单个条件对象和条件数组
   * - 验证租户ID是否存在
   * - 保持输入和输出格式一致
   *
   * @param criteria - 查询条件
   * @returns 添加了租户ID的查询条件
   * @throws GeneralInternalServerException 当租户ID未设置时
   */
  protected override presetWhereOptions(
    criteria: FindOptionsWhere<ENTITY> | Array<FindOptionsWhere<ENTITY>>,
  ): FindOptionsWhere<ENTITY> | Array<FindOptionsWhere<ENTITY>> {
    const options = super.presetWhereOptions(criteria);

    const optionsArray = Array.isArray(options) ? options : [options];

    const clsStore = this.clsService.get();

    const tenantId = clsStore?.tenantId;

    if (!clsStore || !tenantId) {
      throw new GeneralInternalServerException(
        `TenantId is not set for the required tenant id repository, it's either not set in the request
        or you are trying to use the repository outside of the request scope or someone trying to cheat`,
      );
    }

    const result = optionsArray.map((option) => {
      return {
        // allow to override tenantId from user perspective
        tenantId: tenantId,
        ...option,
      };
    });

    return Array.isArray(criteria) ? result : result[0];
  }
}
