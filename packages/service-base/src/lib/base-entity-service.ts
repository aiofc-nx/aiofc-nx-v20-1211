import { Transactional } from 'typeorm-transactional';

import { BaseService } from './base-service';
import { PaginateConfig, Paginated, PaginateQuery } from 'nestjs-paginate';
import { ClassConstructor } from 'class-transformer';
import { ClassTransformOptions } from 'class-transformer/types/interfaces';
import { map } from '@aiofc/validation';
import { Never } from '@aiofc/common-types';
import { ObjectNotFoundException } from '@aiofc/exceptions';
import { BaseRepository, IBaseEntity } from '@aiofc/persistence-base';
/**
 * @description 以泛型类的形式继承了抽象基础服务类AbstractBaseService，
 * 并实现了具体的方法，这些实现方法都带有TypeORM的事务注解@Transactional()，具有事务处理的能力，
 * 因此，这个类可以应用在TypeORM的实体操作中,因为它已经不是一个抽象类了。
 */

/**
 * 基础实体服务类
 *
 * 泛型参数:
 * - ENTITY: 实体类型,必须继承自IBaseEntity
 * - ID: 实体ID字段类型,必须是ENTITY的键名
 * - REPOSITORY: 仓储类型,必须继承自BaseRepository
 * - FIELDS_REQUIRED_FOR_UPDATE: 更新时必需的字段,默认为ID
 * - AUTO_GENERATED_FIELDS: 自动生成的字段,默认为ID
 */
export class BaseEntityService<
  ENTITY extends IBaseEntity,
  ID extends keyof ENTITY,
  REPOSITORY extends BaseRepository<
    ENTITY,
    ID,
    unknown,
    FIELDS_REQUIRED_FOR_UPDATE,
    AUTO_GENERATED_FIELDS
  >,
  FIELDS_REQUIRED_FOR_UPDATE extends keyof ENTITY = ID,
  AUTO_GENERATED_FIELDS extends keyof ENTITY = ID,
> extends BaseService<
  ENTITY,
  ID,
  FIELDS_REQUIRED_FOR_UPDATE,
  AUTO_GENERATED_FIELDS
> {
  /**
   * 构造函数
   * @param repository - 实体仓储实例
   */
  constructor(protected readonly repository: REPOSITORY) {
    super();
  }

  /**
   * 创建实体方法
   *
   * 提供两个重载:
   * 1. 创建单个实体
   * 2. 批量创建多个实体
   *
   * 参数类型说明:
   * - 排除自动生成字段
   * - ID字段可选
   */
  create(
    entity: Omit<ENTITY, AUTO_GENERATED_FIELDS> & Partial<Pick<ENTITY, ID>>,
  ): Promise<ENTITY>;

  create(
    entities: Array<
      Omit<ENTITY, AUTO_GENERATED_FIELDS> & Partial<Pick<ENTITY, ID>>
    >,
  ): Promise<Array<ENTITY>>;

  /**
   * 创建实体的具体实现
   * 使用@Transactional()装饰器确保事务
   *
   * 参数说明:
   * - entities: 可以是单个实体或实体数组
   *   - 类型为 Omit<ENTITY, AUTO_GENERATED_FIELDS>: 排除自动生成的字段
   *   - & Partial<Pick<ENTITY, ID>>: ID字段可选
   *
   * 返回值:
   * - Promise<ENTITY | ENTITY[]>: 返回创建的实体或实体数组
   *
   * 实现逻辑:
   * 1. 使用 Array.isArray() 判断参数是否为数组
   * 2. 如果是数组,调用 repository.create 批量创建
   * 3. 如果是单个实体,调用 repository.create 创建单个
   * 4. @Transactional() 装饰器确保创建操作在事务中执行
   */
  @Transactional()
  override create(
    entities:
      | (Omit<ENTITY, AUTO_GENERATED_FIELDS> & Partial<Pick<ENTITY, ID>>)
      | Array<Omit<ENTITY, AUTO_GENERATED_FIELDS> & Partial<Pick<ENTITY, ID>>>,
  ): Promise<ENTITY | ENTITY[]> {
    return Array.isArray(entities)
      ? this.repository.create(entities)
      : this.repository.create(entities);
  }

  /**
   * 更新实体方法
   *
   * 提供两个重载:
   * 1. 更新单个实体
   * 2. 批量更新多个实体
   *
   * 参数类型说明:
   * - entity: 要更新的实体或实体数组
   *   - Omit<ENTITY, AUTO_GENERATED_FIELDS>: 排除自动生成的字段
   *   - Pick<ENTITY, FIELDS_REQUIRED_FOR_UPDATE>: 必须包含更新所需的必要字段
   *
   * 返回值:
   * - Promise<ENTITY>: 返回更新后的单个实体
   * - Promise<Array<ENTITY>>: 返回更新后的实体数组
   */
  update(
    entity: Omit<ENTITY, AUTO_GENERATED_FIELDS> &
      Pick<ENTITY, FIELDS_REQUIRED_FOR_UPDATE>,
  ): Promise<ENTITY>;

  update(
    entities: Array<
      Omit<ENTITY, AUTO_GENERATED_FIELDS> &
        Pick<ENTITY, FIELDS_REQUIRED_FOR_UPDATE>
    >,
  ): Promise<Array<ENTITY>>;

  /**
   * 更新实体的具体实现
   *
   * 参数说明:
   * - entity: 可以是单个实体或实体数组
   *   - 类型为 Omit<ENTITY, AUTO_GENERATED_FIELDS>: 排除自动生成的字段
   *   - & Pick<ENTITY, FIELDS_REQUIRED_FOR_UPDATE>: 必须包含更新所需的必要字段
   *
   * 返回值:
   * - Promise<ENTITY | ENTITY[]>: 返回更新后的实体或实体数组
   *
   * 实现逻辑:
   * 1. 使用 Array.isArray() 判断参数是否为数组
   * 2. 如果是数组,调用 repository.update 批量更新
   * 3. 如果是单个实体,调用 repository.update 更新单个
   * 4. @Transactional() 装饰器确保更新操作在事务中执行
   */
  @Transactional()
  override update(
    entity:
      | Array<
          Omit<ENTITY, AUTO_GENERATED_FIELDS> &
            Pick<ENTITY, FIELDS_REQUIRED_FOR_UPDATE>
        >
      | (Omit<ENTITY, AUTO_GENERATED_FIELDS> &
          Pick<ENTITY, FIELDS_REQUIRED_FOR_UPDATE>),
  ): Promise<ENTITY | ENTITY[]> {
    return Array.isArray(entity)
      ? this.repository.update(entity)
      : this.repository.update(entity);
  }

  /**
   * 更新或创建实体方法(upsert)
   *
   * 该方法提供了两个重载:
   * 1. 处理单个实体
   * 2. 批量处理多个实体
   *
   * 类型说明:
   * - ENTITY: 实体类型
   * - AUTO_GENERATED_FIELDS: 自动生成的字段(如id、创建时间等)
   * - FIELDS_REQUIRED_FOR_UPDATE: 更新时必需的字段
   *
   * 参数类型:
   * 1. 排除自动生成字段和必需字段:
   *    Omit<ENTITY, AUTO_GENERATED_FIELDS | FIELDS_REQUIRED_FOR_UPDATE>
   * 2. 必需字段可选且不可为null:
   *    Partial<Never<Pick<ENTITY, FIELDS_REQUIRED_FOR_UPDATE>>>
   * 3. 必需字段必填:
   *    Pick<ENTITY, FIELDS_REQUIRED_FOR_UPDATE>
   */
  upsert(
    entity:
      | (Omit<ENTITY, AUTO_GENERATED_FIELDS | FIELDS_REQUIRED_FOR_UPDATE> &
          Partial<Never<Pick<ENTITY, FIELDS_REQUIRED_FOR_UPDATE>>>)
      | (Omit<ENTITY, AUTO_GENERATED_FIELDS | FIELDS_REQUIRED_FOR_UPDATE> &
          Pick<ENTITY, FIELDS_REQUIRED_FOR_UPDATE>),
  ): Promise<ENTITY>;

  upsert(
    entities: Array<
      | (Omit<ENTITY, AUTO_GENERATED_FIELDS | FIELDS_REQUIRED_FOR_UPDATE> &
          Partial<Never<Pick<ENTITY, FIELDS_REQUIRED_FOR_UPDATE>>>)
      | (Omit<ENTITY, AUTO_GENERATED_FIELDS | FIELDS_REQUIRED_FOR_UPDATE> &
          Pick<ENTITY, FIELDS_REQUIRED_FOR_UPDATE>)
    >,
  ): Promise<ENTITY[]>;

  /**
   * 更新或创建实体的具体实现方法
   *
   * 方法说明:
   * - 使用@Transactional()装饰器包装方法,确保数据库操作的事务完整性
   * - 实现了upsert方法的重载,支持单个实体和实体数组两种入参形式
   *
   * 参数类型说明:
   * - entities: 支持两种形式的入参
   *   1. 实体数组:
   *      - 排除了自动生成字段和必需字段
   *      - 必需字段可以是可选的(Partial)或必填的(Pick)
   *   2. 单个实体:
   *      - 排除了自动生成字段和必需字段
   *      - 必需字段可以是可选的(Partial)或必填的(Pick)
   *
   * 实现逻辑:
   * 1. 通过Array.isArray()判断入参是数组还是单个实体
   * 2. 根据入参类型调用repository.upsert()方法
   * 3. 返回Promise<ENTITY | ENTITY[]>类型的结果
   */
  @Transactional()
  override upsert(
    entities:
      | Array<
          | (Omit<ENTITY, AUTO_GENERATED_FIELDS | FIELDS_REQUIRED_FOR_UPDATE> &
              Partial<Never<Pick<ENTITY, FIELDS_REQUIRED_FOR_UPDATE>>>)
          | (Omit<ENTITY, AUTO_GENERATED_FIELDS | FIELDS_REQUIRED_FOR_UPDATE> &
              Pick<ENTITY, FIELDS_REQUIRED_FOR_UPDATE>)
        >
      | (Omit<ENTITY, AUTO_GENERATED_FIELDS | FIELDS_REQUIRED_FOR_UPDATE> &
          Partial<Never<Pick<ENTITY, FIELDS_REQUIRED_FOR_UPDATE>>>)
      | (Omit<ENTITY, AUTO_GENERATED_FIELDS | FIELDS_REQUIRED_FOR_UPDATE> &
          Pick<ENTITY, FIELDS_REQUIRED_FOR_UPDATE>),
  ): Promise<ENTITY | ENTITY[]> {
    return Array.isArray(entities)
      ? this.repository.upsert(entities)
      : this.repository.upsert(entities);
  }

  /**
   * 部分更新实体方法
   *
   * 该方法提供了两个重载:
   * 1. 部分更新单个实体
   * 2. 批量部分更新多个实体
   *
   * 类型说明:
   * - Partial<Omit<ENTITY, AUTO_GENERATED_FIELDS>>:
   *   - 排除自动生成字段
   *   - 所有字段都是可选的
   * - Pick<ENTITY, FIELDS_REQUIRED_FOR_UPDATE>:
   *   - 必须包含更新所需的必要字段
   */
  partialUpdate(
    entity: Partial<Omit<ENTITY, AUTO_GENERATED_FIELDS>> &
      Pick<ENTITY, FIELDS_REQUIRED_FOR_UPDATE>,
  ): Promise<Partial<ENTITY>>;

  partialUpdate(
    entities: Array<
      Partial<Omit<ENTITY, AUTO_GENERATED_FIELDS>> &
        Pick<ENTITY, FIELDS_REQUIRED_FOR_UPDATE>
    >,
  ): Promise<Array<Partial<ENTITY>>>;

  /**
   * 部分更新实体的具体实现
   *
   * 实现细节:
   * 1. 使用@Transactional()装饰器确保事务完整性
   * 2. 通过Array.isArray()判断入参类型:
   *    - 数组: 批量更新多个实体
   *    - 单个对象: 更新单个实体
   * 3. 调用repository.updatePartial()执行实际的更新操作
   *
   * 参数类型:
   * - entities: 支持数组或单个实体
   *   - 实体字段可选(Partial)
   *   - 排除自动生成字段(Omit)
   *   - 必须包含更新必需字段(Pick)
   *
   * 返回值:
   * - Promise<Partial<ENTITY> | Array<Partial<ENTITY>>>
   *   根据入参类型返回单个或多个更新后的实体
   */
  @Transactional()
  override partialUpdate(
    entities:
      | Array<
          Partial<Omit<ENTITY, AUTO_GENERATED_FIELDS>> &
            Pick<ENTITY, FIELDS_REQUIRED_FOR_UPDATE>
        >
      | (Partial<Omit<ENTITY, AUTO_GENERATED_FIELDS>> &
          Pick<ENTITY, FIELDS_REQUIRED_FOR_UPDATE>),
  ): Promise<Partial<ENTITY> | Array<Partial<ENTITY>>> {
    return Array.isArray(entities)
      ? this.repository.updatePartial(entities)
      : this.repository.updatePartial(entities);
  }

  /**
   * 根据ID查找实体方法
   *
   * 提供多个重载:
   * 1. 查找单个实体
   * 2. 查找单个实体(指定是否抛出异常)
   * 3. 批量查找多个实体
   */
  findById(id: ENTITY[ID]): Promise<ENTITY>;
  findById(id: ENTITY[ID], throwExceptionIfNotFound: true): Promise<ENTITY>;
  findById(
    id: ENTITY[ID],
    throwExceptionIfNotFound: false,
  ): Promise<ENTITY | undefined>;
  findById(ids: Array<ENTITY[ID]>): Promise<Array<ENTITY>>;

  /**
   * 根据ID查找实体的具体实现
   * 使用@Transactional()装饰器确保事务
   */
  @Transactional()
  override async findById(
    id: Array<ENTITY[ID]> | ENTITY[ID],
    throwExceptionIfNotFound = true,
  ): Promise<undefined | ENTITY | Array<ENTITY>> {
    const ids = Array.isArray(id) ? id : [id];

    const result = await this.repository.findById(ids);

    if (
      !Array.isArray(id) &&
      ids.length === 1 &&
      throwExceptionIfNotFound &&
      result.length === 0
    ) {
      throw new ObjectNotFoundException(this.repository.entityName());
    }

    return Array.isArray(id) ? result : result[0];
  }

  /**
   * 分页查找所有实体
   * 支持类型转换和自定义选项
   */
  @Transactional()
  override async findAllPaginated<T = ENTITY>(
    query: PaginateQuery,
    config: PaginateConfig<ENTITY>,
    clazz?: ClassConstructor<T>,
    options?: ClassTransformOptions,
  ): Promise<Paginated<T>> {
    const result = await this.repository.findAllPaginated(query, config);

    if (clazz) {
      const data = map(result.data, clazz, options);
      return {
        ...result,
        data,
      } as never as Paginated<T>;
    }

    return result as never as Paginated<T>;
  }

  /**
   * 查找所有实体
   * 支持分页参数
   */
  @Transactional()
  override findAll(page = 0, limit = 100): Promise<ENTITY[]> {
    return this.repository.findAll(undefined, {
      limit,
      offset: page * limit,
    });
  }

  /**
   * 删除实体
   * 支持删除单个或多个实体
   */
  @Transactional()
  override delete(id: ENTITY[ID] | Array<ENTITY[ID]>): Promise<boolean> {
    return Array.isArray(id)
      ? this.repository.delete(id)
      : this.repository.delete(id);
  }
}
