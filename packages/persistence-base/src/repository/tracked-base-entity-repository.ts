import { ITrackedBaseEntity } from '../entity/tracked-base-entity-interface';
import { LimitOptions } from './vo/limit-options.interface';
/**
 * @description 以接口的形式定义了一个通用的带可追踪属性的存储库形态，
 * 定义了一些通用的方法，如：findAllWithArchived、archive、restore
 * 这些方法用于：查询所有记录（包括已归档的记录）、归档记录、恢复记录
 * 这些方法的具体实现由继承的类来实现
 */
/**
 * 带可追踪属性的基础实体存储库接口
 *
 * @template ENTITY - 实体类型，必须继承自 ITrackedBaseEntity
 * @template ID - 实体的ID字段类型，必须是 ENTITY 的键名之一
 * @template FIND_OPTIONS - 查询选项类型
 */
export interface ITrackedBaseEntityRepository<
  ENTITY extends ITrackedBaseEntity,
  ID extends keyof ENTITY,
  FIND_OPTIONS,
> {
  /**
   * 查询所有记录，包括已归档的记录
   * @param opt - 查询选项
   * @param limitOptions - 分页选项
   * @returns 返回实体数组的 Promise
   */
  findAllWithArchived(
    opt: FIND_OPTIONS,
    limitOptions?: LimitOptions,
  ): Promise<ENTITY[]>;

  /**
   * 归档记录
   * @param criteria - 单个ID或ID数组
   * @returns 返回操作是否成功的 Promise
   */
  archive(criteria: ENTITY[ID]): Promise<boolean>;
  archive(criteria: Array<ENTITY[ID]>): Promise<boolean>;

  /**
   * 恢复已归档的记录
   * @param criteria - 单个ID或ID数组
   * @returns 返回操作是否成功的 Promise
   */
  restore(criteria: ENTITY[ID]): Promise<boolean>;
  restore(criteria: Array<ENTITY[ID]>): Promise<boolean>;
}
