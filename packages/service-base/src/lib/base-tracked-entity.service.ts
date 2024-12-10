
import {
  BaseRepository,
  ITrackedBaseEntity,
  ITrackedBaseEntityRepository } from '@aiofc/persistence-base';
import { BaseEntityService } from './base-entity-service';
/**
 * @description 以泛型类的形式继承了基础实体服务类BaseEntityService，
 * 并增加了两个方法用于数据的可追踪，包括：归档、恢复
 */

/**
 * 可追踪实体服务基类
 *
 * 类型参数说明:
 * @template ENTITY - 实体类型,必须实现ITrackedBaseEntity接口
 * @template ID - 实体ID字段类型,必须是ENTITY的键
 * @template REPOSITORY - 仓储类型,必须实现ITrackedBaseEntityRepository和BaseRepository接口
 * @template FIELDS_REQUIRED_FOR_UPDATE - 更新时必需的字段,默认为ID
 * @template AUTO_GENERATED_FIELDS - 自动生成的字段,默认为ID和ITrackedBaseEntity的所有字段
 *
 * 继承说明:
 * - 继承自BaseEntityService基类
 * - 增加了归档(软删除)和恢复的功能
 */
export class BaseTrackedEntityService<
  /**
   * 泛型参数说明:
   *
   * @template ENTITY - 实体类型
   *   - 必须继承ITrackedBaseEntity接口
   *   - 包含了可追踪实体的基本属性(如创建时间、更新时间等)
   *
   * @template ID - 实体的主键类型
   *   - 必须是ENTITY中的一个键名
   *   - 用于唯一标识实体
   *
   * @template REPOSITORY - 仓储类型
   *   - 必须同时实现ITrackedBaseEntityRepository和BaseRepository接口
   *   - ITrackedBaseEntityRepository提供归档和恢复功能
   *   - BaseRepository提供基础的CRUD操作
   *
   * @template FIELDS_REQUIRED_FOR_UPDATE - 更新时必需的字段
   *   - 默认为ID字段
   *   - 必须是ENTITY的键名
   *
   * @template AUTO_GENERATED_FIELDS - 自动生成的字段
   *   - 默认包含ID和ITrackedBaseEntity的所有字段
   *   - 这些字段在创建和更新时会自动处理
   */
  ENTITY extends ITrackedBaseEntity,
  ID extends keyof ENTITY,
  REPOSITORY extends ITrackedBaseEntityRepository<ENTITY, ID, unknown> &
    BaseRepository<
      ENTITY,
      ID,
      unknown,
      FIELDS_REQUIRED_FOR_UPDATE,
      AUTO_GENERATED_FIELDS
    >,
  FIELDS_REQUIRED_FOR_UPDATE extends keyof ENTITY = ID,
  AUTO_GENERATED_FIELDS extends keyof ENTITY = ID | keyof ITrackedBaseEntity,
> extends BaseEntityService<
  ENTITY,
  ID,
  REPOSITORY,
  FIELDS_REQUIRED_FOR_UPDATE,
  AUTO_GENERATED_FIELDS
> {
  /**
   * 构造函数
   * @param repository 实体仓储实例
   */
  constructor(repository: REPOSITORY) {
    super(repository);
  }

  /**
   * 归档实体(软删除)
   *
   * 方法说明:
   * - 用于将实体标记为归档状态(软删除)
   * - 支持单个实体ID或多个实体ID的批量操作
   *
   * 参数说明:
   * @param id - 支持两种类型:
   *   1. ENTITY[ID]: 单个实体的ID
   *   2. Array<ENTITY[ID]>: 多个实体ID组成的数组
   *
   * 实现逻辑:
   * 1. 使用Array.isArray()判断入参类型
   * 2. 根据入参类型调用repository.archive()方法:
   *    - 数组: 批量归档多个实体
   *    - 单个ID: 归档单个实体
   *
   * 返回值:
   * @returns Promise<boolean> - 操作执行结果
   *   - true: 归档成功
   *   - false: 归档失败
   */
  archive(id: ENTITY[ID] | Array<ENTITY[ID]>): Promise<boolean> {
    return Array.isArray(id)
      ? this.repository.archive(id)
      : this.repository.archive(id);
  }

  /**
   * 恢复已归档的实体
   *
   * 方法说明:
   * - 用于将已归档(软删除)的实体恢复为正常状态
   * - 支持单个实体ID或多个实体ID的批量操作
   *
   * 参数说明:
   * @param id - 支持两种类型:
   *   1. ENTITY[ID]: 单个实体的ID
   *   2. Array<ENTITY[ID]>: 多个实体ID组成的数组
   *
   * 实现逻辑:
   * 1. 使用Array.isArray()判断入参类型
   * 2. 根据入参类型调用对应的repository.restore()方法:
   *    - 数组: 批量恢复多个实体
   *    - 单个ID: 恢复单个实体
   *
   * 返回值:
   * @returns Promise<boolean> - 操作执行结果
   *   - true: 操作成功
   *   - false: 操作失败
   */
  restore(id: ENTITY[ID] | Array<ENTITY[ID]>): Promise<boolean> {
    return Array.isArray(id)
      ? this.repository.restore(id)
      : this.repository.restore(id);
  }
}
