import { PaginateConfig, Paginated, PaginateQuery } from 'nestjs-paginate';
import { Never } from '@aiofc/common-types';
import { LimitOptions } from './vo/limit-options.interface';
import { IBaseEntity } from '../entity/base-entity-interface';

/**
 * 基础仓储抽象类
 * @description 以抽象类的形式描述了一个通用的Repository的形态，定义了一些通用的方法，如：
 * upsert、create、update、updatePartial、updateByQuery、
 * count、findAll、findAllPaginated、findById、findOne、delete、
 * entityName、presetWhereOptions
 * 这个类并不是直接继承 typeorm 的 Repository 类（https://www.typeorm.net/working-with-repository）
 * 而是一个自定义的类，但是方法命名上和 typeorm 的 Repository 类的方法尽量一致
 * 这些方法的具体实现由继承它的 TypeormRepository 类来实现
 *
 * 泛型参数说明:
 * - ENTITY: 实体类型,必须满足IBaseEntity接口的定义，尽管IBaseEntity只是一个空接口
 * - ID: 实体ID字段的类型,必须是ENTITY的键
 * - FIND_OPTIONS: 查询选项类型 https://www.typeorm.net/find-options
 * - FIELDS_REQUIRED_FOR_UPDATE: 更新时必需的字段,默认为ID
 * - AUTO_GENERATED_FIELDS: 自动生成的字段,默认为基础实体字段和ID
 */
export abstract class BaseRepository<
  ENTITY extends IBaseEntity,
  ID extends keyof ENTITY,
  FIND_OPTIONS,
  FIELDS_REQUIRED_FOR_UPDATE extends keyof ENTITY = ID,
  AUTO_GENERATED_FIELDS extends keyof ENTITY = keyof IBaseEntity | ID
> {
  /**
   * 更新或插入实体
   * - 如果实体存在则更新,不存在则插入
   * - 支持单个实体或实体数组
   * - 自动生成的字段和必需字段会被排除在输入之外
   */
  abstract upsert(
    entity:
      | (Omit<ENTITY, AUTO_GENERATED_FIELDS | FIELDS_REQUIRED_FOR_UPDATE> &
          Partial<Never<Pick<ENTITY, FIELDS_REQUIRED_FOR_UPDATE>>>)
      | (Omit<ENTITY, AUTO_GENERATED_FIELDS | FIELDS_REQUIRED_FOR_UPDATE> &
          Pick<ENTITY, FIELDS_REQUIRED_FOR_UPDATE>)
  ): Promise<ENTITY>;

  abstract upsert(
    entities: Array<
      | (Omit<ENTITY, AUTO_GENERATED_FIELDS | FIELDS_REQUIRED_FOR_UPDATE> &
          Partial<Never<Pick<ENTITY, FIELDS_REQUIRED_FOR_UPDATE>>>)
      | (Omit<ENTITY, AUTO_GENERATED_FIELDS | FIELDS_REQUIRED_FOR_UPDATE> &
          Pick<ENTITY, FIELDS_REQUIRED_FOR_UPDATE>)
    >
  ): Promise<ENTITY[]>;

  /**
   * 创建实体
   * - 如果实体已存在则抛出错误
   * - 支持单个实体或实体数组
   * - 自动生成的字段会被排除,ID字段可选
   */
  abstract create(
    entity: Omit<ENTITY, AUTO_GENERATED_FIELDS> & Partial<Pick<ENTITY, ID>>
  ): Promise<ENTITY>;

  abstract create(
    entities: Array<
      Omit<ENTITY, AUTO_GENERATED_FIELDS> & Partial<Pick<ENTITY, ID>>
    >
  ): Promise<Array<ENTITY>>;

  /**
   * 更新实体
   * - 如果实体不存在则抛出错误
   * - 支持单个实体或实体数组
   * - 必须包含必需字段,自动生成字段被排除
   */
  abstract update(
    entity: Omit<ENTITY, AUTO_GENERATED_FIELDS> &
      Pick<ENTITY, FIELDS_REQUIRED_FOR_UPDATE>
  ): Promise<ENTITY>;

  abstract update(
    entities: Array<
      Omit<ENTITY, AUTO_GENERATED_FIELDS> &
        Pick<ENTITY, FIELDS_REQUIRED_FOR_UPDATE>
    >
  ): Promise<Array<ENTITY>>;

  /**
   * 部分更新实体
   * - 如果实体不存在则抛出错误
   * - 支持单个实体或实体数组
   * - 必须包含必需字段,其他字段可选
   */
  abstract updatePartial(
    entity: Partial<Omit<ENTITY, AUTO_GENERATED_FIELDS>> &
      Pick<ENTITY, FIELDS_REQUIRED_FOR_UPDATE>
  ): Promise<Partial<ENTITY>>;

  abstract updatePartial(
    entities: Array<
      Partial<Omit<ENTITY, AUTO_GENERATED_FIELDS>> &
        Pick<ENTITY, FIELDS_REQUIRED_FOR_UPDATE>
    >
  ): Promise<Array<Partial<ENTITY>>>;

  /**
   * 根据查询条件批量更新实体
   * @param data 要更新的数据
   * @param query 查询条件
   * @returns 更新的记录数
   */
  abstract updateByQuery(
    data: Partial<Omit<ENTITY, AUTO_GENERATED_FIELDS>>,
    query: FIND_OPTIONS
  ): Promise<number>;

  /**
   * 统计符合条件的实体数量
   * @param query 可选的查询条件
   */
  abstract count(query?: FIND_OPTIONS): Promise<number>;

  /**
   * 查找所有符合条件的实体
   * @param query 可选的查询条件
   * @param limitOptions 可选的分页选项
   */
  abstract findAll(
    query?: FIND_OPTIONS,
    limitOptions?: LimitOptions
  ): Promise<ENTITY[]>;

  /**
   * 分页查询实体
   * @param query 分页查询参数
   * @param config 分页配置
   */
  abstract findAllPaginated(
    query: PaginateQuery,
    config: PaginateConfig<ENTITY>
  ): Promise<Paginated<ENTITY>>;

  /**
   * 根据ID查找实体
   * - 支持单个ID或ID数组
   */
  abstract findById(id: ENTITY[ID]): Promise<ENTITY | undefined>;
  abstract findById(ids: Array<ENTITY[ID]>): Promise<Array<ENTITY>>;

  /**
   * 根据条件查找单个实体
   */
  abstract findOne(where: FIND_OPTIONS): Promise<ENTITY | undefined>;

  /**
   * 删除实体
   * - 支持单个ID或ID数组
   * @returns 删除是否成功
   */
  abstract delete(criteria: ENTITY[ID]): Promise<boolean>;
  abstract delete(criteria: Array<ENTITY[ID]>): Promise<boolean>;

  /**
   * 获取实体名称
   * - 通常是类名,也可以是表名或其他标识符
   * - 用于国际化等场景
   */
  abstract entityName(): string;

  /**
   * 预设查询条件
   * - 用于自动填充过滤条件
   * - 适用于权限系统、租户过滤等场景
   * - 可以创造性地添加任何过滤条件
   */
  protected presetWhereOptions(criteria: FIND_OPTIONS): FIND_OPTIONS {
    return criteria;
  }
}
