import { PaginateConfig, Paginated, PaginateQuery } from 'nestjs-paginate';
import { ClassConstructor } from 'class-transformer';
import { ClassTransformOptions } from 'class-transformer/types/interfaces';
import { Never } from '@aiofc/common-types';
import { IBaseEntity } from '@aiofc/persistence-base';
/**
 * @description 以抽象类的形式定义了一组基础的服务方法，包括：
 * 更新、创建、更新或创建、部分更新、查找、分页查找、删除等
 * 在这个抽象类中并没有实现具体的方法，而是定义了方法的签名
 */

/**
 * 基础服务抽象类
 *
 * 泛型参数:
 * - ENTITY: 实体类型,必须继承自IBaseEntity
 * - ID: 实体ID字段类型,必须是ENTITY的键名
 * - FIELDS_REQUIRED_FOR_UPDATE: 更新时必需的字段,默认为ID
 * - AUTO_GENERATED_FIELDS: 自动生成的字段,默认为ID和基础实体字段
 */
export abstract class BaseService<
  ENTITY extends IBaseEntity,
  ID extends keyof ENTITY,
  FIELDS_REQUIRED_FOR_UPDATE extends keyof ENTITY = ID,
  AUTO_GENERATED_FIELDS extends keyof ENTITY = ID | keyof IBaseEntity,
> {
  /**
   * 更新实体
   *
   * 提供两个重载:
   * 1. 更新单个实体
   * 2. 批量更新多个实体
   *
   * 参数类型说明:
   * - 排除自动生成字段
   * - 必须包含更新所需的必要字段
   */
  abstract update(
    entity: Omit<ENTITY, AUTO_GENERATED_FIELDS> &
      Pick<ENTITY, FIELDS_REQUIRED_FOR_UPDATE>,
  ): Promise<ENTITY>;

  abstract update(
    entities: Array<
      Omit<ENTITY, AUTO_GENERATED_FIELDS> &
        Pick<ENTITY, FIELDS_REQUIRED_FOR_UPDATE>
    >,
  ): Promise<Array<ENTITY>>;

  /**
   * 创建实体
   *
   * 提供两个重载:
   * 1. 创建单个实体
   * 2. 批量创建多个实体
   *
   * 参数类型说明:
   * - 排除自动生成字段
   * - ID字段可选
   */
  abstract create(
    entity: Omit<ENTITY, AUTO_GENERATED_FIELDS> & Partial<Pick<ENTITY, ID>>,
  ): Promise<ENTITY>;

  abstract create(
    entities: Array<
      Omit<ENTITY, AUTO_GENERATED_FIELDS> & Partial<Pick<ENTITY, ID>>
    >,
  ): Promise<Array<ENTITY>>;

  /**
   * 更新或创建实体
   *
   * 提供两个重载:
   * 1. 单个实体的更新或创建
   * 2. 批量更新或创建多个实体
   *
   * 参数类型说明:
   * - 排除自动生成字段和必需字段
   * - 必需字段可选或必需
   */
  abstract upsert(
    entity:
      | (Omit<ENTITY, AUTO_GENERATED_FIELDS | FIELDS_REQUIRED_FOR_UPDATE> &
          Partial<Never<Pick<ENTITY, FIELDS_REQUIRED_FOR_UPDATE>>>)
      | (Omit<ENTITY, AUTO_GENERATED_FIELDS | FIELDS_REQUIRED_FOR_UPDATE> &
          Pick<ENTITY, FIELDS_REQUIRED_FOR_UPDATE>),
  ): Promise<ENTITY>;

  abstract upsert(
    entities: Array<
      | (Omit<ENTITY, AUTO_GENERATED_FIELDS | FIELDS_REQUIRED_FOR_UPDATE> &
          Partial<Never<Pick<ENTITY, FIELDS_REQUIRED_FOR_UPDATE>>>)
      | (Omit<ENTITY, AUTO_GENERATED_FIELDS | FIELDS_REQUIRED_FOR_UPDATE> &
          Pick<ENTITY, FIELDS_REQUIRED_FOR_UPDATE>)
    >,
  ): Promise<ENTITY[]>;

  /**
   * 部分更新实体
   * 如果实体不存在则抛出异常
   *
   * 提供两个重载:
   * 1. 部分更新单个实体
   * 2. 批量部分更新多个实体
   *
   * 参数类型说明:
   * - 排除自动生成字段的部分字段
   * - 必须包含更新所需的必要字段
   */
  abstract partialUpdate(
    entity: Partial<Omit<ENTITY, AUTO_GENERATED_FIELDS>> &
      Pick<ENTITY, FIELDS_REQUIRED_FOR_UPDATE>,
  ): Promise<Partial<ENTITY>>;

  abstract partialUpdate(
    entities: Array<
      Partial<Omit<ENTITY, AUTO_GENERATED_FIELDS>> &
        Pick<ENTITY, FIELDS_REQUIRED_FOR_UPDATE>
    >,
  ): Promise<Array<Partial<ENTITY>>>;

  /**
   * 分页查找所有实体
   * @param page 页码
   * @param limit 每页数量
   */
  abstract findAll(page: number, limit: number): Promise<ENTITY[]>;

  /**
   * 根据ID查找实体
   *
   * 提供多个重载:
   * 1. 查找单个实体(必定存在)
   * 2. 查找多个实体
   * 3. 查找单个实体(可能不存在)
   * 4. 查找多个实体
   */
  abstract findById(
    id: ENTITY[ID],
    throwExceptionIfNotFound: true,
  ): Promise<ENTITY>;
  abstract findById(ids: Array<ENTITY[ID]>): Promise<Array<ENTITY>>;

  abstract findById(
    id: ENTITY[ID],
    throwExceptionIfNotFound: false,
  ): Promise<ENTITY | undefined>;

  abstract findById(ids: Array<ENTITY[ID]>): Promise<Array<ENTITY>>;

  /**
   * 分页查找并转换实体
   * @param query 分页查询参数
   * @param config 分页配置
   * @param clazz 目标类构造器(可选)
   * @param options 类转换选项(可选)
   */
  abstract findAllPaginated<T = ENTITY>(
    query: PaginateQuery,
    config: PaginateConfig<ENTITY>,
    clazz?: ClassConstructor<T>,
    options?: ClassTransformOptions,
  ): Promise<Paginated<T>>;

  /**
   * 删除实体
   * @param id 实体ID
   * @returns 是否删除成功
   */
  abstract delete(id: ENTITY[ID]): Promise<boolean>;
}
