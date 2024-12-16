import { DataSource, FindOptionsWhere, In, IsNull, Not } from 'typeorm';
import { TypeormRepository } from './typeorm-repository';
import { ObjectType } from 'typeorm/common/ObjectType';
import { TrackedTypeormBaseEntity } from '../entity/tracked-typeorm-base-entity';
import { ITrackedBaseEntityRepository, LimitOptions } from '@aiofc/persistence-base';

/**
 * 可追踪的TypeORM仓储抽象类
 *
 * 该类通过继承和实现来组合功能:
 * 1. 继承TypeormRepository:
 *    - 获得基础仓储的所有功能
 * 2. 实现ITrackedBaseEntityRepository接口:
 *    - 提供归档和恢复功能
 *
 * 泛型参数说明:
 * - ENTITY: 实体类型,必须继承自TrackedTypeormBaseEntity
 * - ID: 实体ID字段类型,必须是ENTITY的键名
 * - FIELDS_REQUIRED_FOR_UPDATE: 更新时必需的字段,默认为ID
 * - AUTO_GENERATED_FIELDS: 自动生成的字段,默认为基础实体字段和ID
 */
export abstract class TrackedTypeormRepository<
    ENTITY extends TrackedTypeormBaseEntity,
    ID extends keyof ENTITY,
    FIELDS_REQUIRED_FOR_UPDATE extends keyof ENTITY = ID,
    AUTO_GENERATED_FIELDS extends keyof ENTITY =
      | keyof TrackedTypeormBaseEntity
      | ID,
  >
  extends TypeormRepository<
    ENTITY,
    ID,
    FIELDS_REQUIRED_FOR_UPDATE,
    AUTO_GENERATED_FIELDS
  >
  implements ITrackedBaseEntityRepository<ENTITY, ID, FindOptionsWhere<ENTITY>>
{
  /**
   * 构造函数
   * @param entityTarget - 实体类
   * @param dataSource - 数据源
   * @param idFieldName - ID字段名
   */
  protected constructor(
    entityTarget: ObjectType<ENTITY>,
    dataSource: DataSource,
    idFieldName: ID,
  ) {
    super(entityTarget, dataSource, idFieldName);
  }

  /**
   * 归档方法
   *
   * 提供两个重载:
   * 1. 归档单个记录
   * 2. 归档多个记录
   *
   * 实现细节:
   * - 通过设置deletedAt字段实现软删除
   * - 只能归档未删除的记录(deletedAt为null)
   * - 返回是否全部归档成功
   */
  archive(criteria: ENTITY[ID]): Promise<boolean>;
  archive(criteria: Array<ENTITY[ID]>): Promise<boolean>;
  async archive(criteria: ENTITY[ID] | Array<ENTITY[ID]>): Promise<boolean> {
    const result = await this.updateByQuery(
      {
        deletedAt: new Date(),
      } as Partial<ENTITY>,
      {
        [this.idFieldName]: Array.isArray(criteria) ? In(criteria) : criteria,
        deletedAt: IsNull(),
      } as FindOptionsWhere<ENTITY>,
    );

    return Array.isArray(criteria) ? result === criteria.length : result === 1;
  }

  /**
   * 恢复方法
   *
   * 提供两个重载:
   * 1. 恢复单个记录
   * 2. 恢复多个记录
   *
   * 实现细节:
   * - 通过设置deletedAt为null恢复记录
   * - 只能恢复已删除的记录(deletedAt不为null)
   * - 返回是否全部恢复成功
   */
  restore(id: ENTITY[ID]): Promise<boolean>;
  restore(ids: Array<ENTITY[ID]>): Promise<boolean>;
  async restore(id: ENTITY[ID] | Array<ENTITY[ID]>): Promise<boolean> {
    const result = await this.updateByQuery(
      {
        deletedAt: null,
      } as unknown as Partial<ENTITY>,
      {
        id: Array.isArray(id) ? In(id) : id,
        deletedAt: Not(IsNull()),
      } as FindOptionsWhere<NonNullable<ENTITY>>,
    );

    return Array.isArray(id) ? result === id.length : result === 1;
  }

  /**
   * 查询所有记录(包括已归档)
   *
   * 实现细节:
   * - 通过withDeleted选项包含已删除记录
   * - 支持分页查询
   * - 默认每页20条记录
   *
   * @param where - 查询条件
   * @param limitOptions - 分页选项
   * @returns 返回包含已归档的记录数组
   */
  async findAllWithArchived(
    where: FindOptionsWhere<ENTITY>,
    limitOptions?: LimitOptions,
  ): Promise<ENTITY[]> {
    return this.typeormRepository.find({
      where: this.presetWhereOptions(where),
      take: limitOptions?.limit ?? 20,
      skip: limitOptions?.offset ?? 0,
      withDeleted: true,
    });
  }
}
