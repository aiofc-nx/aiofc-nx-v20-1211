import { Logger } from '@nestjs/common';
import {
  DataSource,
  DeepPartial,
  FindOptionsWhere,
  In,
  Repository,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { Never } from '@aiofc/common-types';
import {
  paginate,
  PaginateConfig,
  Paginated,
  PaginateQuery,
} from 'nestjs-paginate';
import { ObjectType } from 'typeorm/common/ObjectType';
import { BaseRepository, LimitOptions } from '@aiofc/persistence-base';
import { TypeormBaseEntity } from '../entity/typeorm-base-entity';

/**
 * 具有类似于TypeORM的Repository功能的类，它实现了BaseRepository中定义的所有方法。
 * https://www.typeorm.net/working-with-repository
 *
 * @description 这是抽象层BaseRepository类的具体实现，尽管它仍然是一个抽象类，但它实现了BaseRepository中定义的所有方法。
 * 我们在这个类中引入了TypeORM的Repository类，这个类是TypeORM中的一个重要类，它提供了对实体的基本操作能力。
 * 具体见：protected typeormRepository: Repository<ENTITY>;
 *
 * 该类通过继承和实现来组合功能:
 * 1. 继承BaseRepository:
 *    - 获得基础仓储的所有抽象方法定义
 * 2. 使用TypeORM的Repository:
 *    - 实现具体的数据库操作
 *
 * 泛型参数说明:
 * - ENTITY: 实体类型,必须继承自TypeormBaseEntity
 * - ID: 实体ID字段类型,必须是ENTITY的键名
 * - FIELDS_REQUIRED_FOR_UPDATE: 更新时必需的字段,默认为ID
 * - AUTO_GENERATED_FIELDS: 自动生成的字段,默认为ID和基础实体字段
 */
export abstract class TypeormRepository<
  ENTITY extends TypeormBaseEntity,
  ID extends keyof ENTITY,
  FIELDS_REQUIRED_FOR_UPDATE extends keyof ENTITY = ID,
  AUTO_GENERATED_FIELDS extends keyof ENTITY = ID | keyof TypeormBaseEntity
> extends BaseRepository<
  ENTITY,
  ID,
  FindOptionsWhere<ENTITY> | Array<FindOptionsWhere<ENTITY>>,
  FIELDS_REQUIRED_FOR_UPDATE,
  AUTO_GENERATED_FIELDS
> {
  /**
   * 日志记录器实例
   */
  protected readonly logger: Logger = new Logger(this.constructor.name);

  /**
   * TypeORM的Repository实例,用于执行具体的数据库操作
   * 在构造函数中通过dataSource.getRepository(entityTarget)来创建
   */
  protected typeormRepository: Repository<ENTITY>;

  /**
   * 构造函数
   * @param entityTarget - 实体类
   * @param dataSource - 数据源
   * @param idFieldName - ID字段名
   */
  protected constructor(
    protected entityTarget: ObjectType<ENTITY>,
    protected dataSource: DataSource,
    protected idFieldName: ID
  ) {
    super();
    this.typeormRepository = dataSource.getRepository(entityTarget);
  }

  /**
   * 统计记录数方法
   *
   * 该方法实现了记录统计功能:
   * 1. 参数说明:
   *    - query: TypeORM的查询条件对象,可以是单个条件或条件数组
   *    - 默认为空对象,表示统计所有记录
   *
   * 2. 实现细节:
   *    - 通过presetWhereOptions预处理查询条件
   *      - 如添加租户ID等通用条件
   *    - 调用typeormRepository.countBy执行统计
   *
   * 3. 返回值:
   *    - 返回Promise<number>表示记录总数
   *
   * @param query - 查询条件,可选参数
   * @returns 返回记录数量的Promise
   */
  override count(
    query: FindOptionsWhere<ENTITY> | Array<FindOptionsWhere<ENTITY>> = {}
  ): Promise<number> {
    return this.typeormRepository.countBy(this.presetWhereOptions(query));
  }

  /**
   * 分页查询方法
   *
   * 该方法实现了分页查询功能:
   * 1. 参数说明:
   *    - query: 分页查询参数,包含页码、每页数量等
   *    - config: 分页配置,包含排序、搜索等选项
   *
   * 2. 实现细节:
   *    - 创建QueryBuilder用于构建SQL查询
   *    - 通过presetWhereOptions预处理查询条件
   *      - 如添加租户ID等通用条件
   *    - 将条件应用到查询构建器
   *    - 调用paginate执行分页查询
   *
   * 3. 返回值:
   *    - 返回分页结果对象
   *    - 包含:
   *      - 当前页数据
   *      - 总记录数
   *      - 分页信息等
   *
   * @param query - 分页查询参数,包含页码、每页数量等
   * @param config - 分页配置,包含排序、搜索等选项
   * @returns 返回分页结果对象
   */
  override findAllPaginated(
    query: PaginateQuery,
    config: PaginateConfig<ENTITY>
  ): Promise<Paginated<ENTITY>> {
    const queryBuilder = this.typeormRepository.createQueryBuilder();

    const where = this.presetWhereOptions({});
    if (Object.keys(where).length > 0) {
      queryBuilder.where(where);
    }

    return paginate(query, queryBuilder, config);
  }

  /**
   * 根据ID查询实体的方法
   *
   * 该方法提供了两个重载:
   * 1. 查询单个实体:
   *    - 参数: 单个ID
   *    - 返回: 单个实体或undefined
   *
   * 2. 查询多个实体:
   *    - 参数: ID数组
   *    - 返回: 实体数组
   *
   * 类型参数说明:
   * - ENTITY: 实体类型
   * - ID: 实体的ID字段类型
   *
   * 实现细节:
   * 1. 判断参数类型:
   *    - 使用Array.isArray判断是否为数组
   *
   * 2. 构造查询条件:
   *    - 单个ID时直接使用ID值
   *    - 多个ID时使用In操作符
   *    - 调用presetWhereOptions添加额外条件(如租户ID)
   *
   * 3. 执行查询:
   *    - 数组参数: 使用find方法查询多条
   *    - 单个参数: 使用findOneBy查询单条
   *      - 处理null返回值为undefined
   *
   * @param ids - 单个ID或ID数组
   * @returns 返回实体或实体数组的Promise
   */
  findById(id: ENTITY[ID]): Promise<ENTITY | undefined>;
  findById(ids: Array<ENTITY[ID]>): Promise<Array<ENTITY>>;

  override findById(
    ids: ENTITY[ID] | Array<ENTITY[ID]>
  ): Promise<ENTITY | undefined | Array<ENTITY>> {
    const isArray = Array.isArray(ids);
    const where = this.presetWhereOptions({
      [this.idFieldName]: isArray ? In(ids) : ids,
    } as FindOptionsWhere<ENTITY>);

    return isArray
      ? this.typeormRepository.find({
          where,
        })
      : this.typeormRepository.findOneBy(where).then((entity) => {
          if (entity === null) {
            return;
          }
          return entity;
        });
  }

  /**
   * 查询单条记录
   *
   * 该方法用于查询符合条件的单个实体记录
   *
   * 实现细节:
   * 1. 参数说明:
   *    - where: 查询条件,支持单个条件对象或条件对象数组
   *    - 条件类型为 FindOptionsWhere<ENTITY>
   *
   * 2. 查询流程:
   *    - 调用 presetWhereOptions 预处理查询条件
   *      (如添加租户ID等额外条件)
   *    - 使用 findOneBy 执行实际查询
   *
   * 3. 结果处理:
   *    - 如果查询结果为 null,返回 undefined
   *    - 否则返回查询到的实体对象
   *
   * @param where - 查询条件,可以是单个条件对象或条件对象数组
   * @returns 返回查询到的实体或 undefined
   */
  override findOne(
    where: FindOptionsWhere<ENTITY> | Array<FindOptionsWhere<ENTITY>>
  ): Promise<ENTITY | undefined> {
    return this.typeormRepository
      .findOneBy(this.presetWhereOptions(where))
      .then((v) => {
        if (v === null) {
          return;
        }
        return v;
      });
  }

  /**
   * 删除记录方法
   *
   * 该方法提供了两个重载:
   * 1. 删除单个记录
   * 2. 删除多个记录
   *
   * 类型参数说明:
   * - ENTITY: 实体类型
   * - ID: 实体的ID字段类型
   *
   * 实现细节:
   * 1. 构造删除条件:
   *    - 单个ID: {idFieldName: id}
   *    - ID数组: {idFieldName: In(ids)}
   *
   * 2. 预处理查询条件:
   *    - 使用presetWhereOptions添加额外的查询条件(如租户ID等)
   *
   * 3. 执行删除操作:
   *    - 调用typeormRepository.delete执行实际删除
   *
   * 4. 返回结果处理:
   *    - 单个删除: affected > 0 表示删除成功
   *    - 批量删除: affected === ids.length 表示全部删除成功
   *
   * @param id - 要删除的记录ID或ID数组
   * @returns 返回布尔值Promise,表示删除是否成功
   */
  delete(id: ENTITY[ID]): Promise<boolean>;
  delete(id: Array<ENTITY[ID]>): Promise<boolean>;

  override async delete(id: ENTITY[ID] | Array<ENTITY[ID]>): Promise<boolean> {
    // 根据输入是否为数组构造不同的查询条件
    const condition = Array.isArray(id)
      ? { [this.idFieldName]: In(id) } // 使用In操作符查询多个ID
      : { [this.idFieldName]: id }; // 直接匹配单个ID

    // 预处理查询条件,添加额外的查询约束
    const where = this.presetWhereOptions(
      condition as FindOptionsWhere<ENTITY>
    ) as FindOptionsWhere<ENTITY>;

    // 执行删除操作
    const deleteResult = await this.typeormRepository.delete(where);

    // 根据输入类型返回不同的成功判断
    return Array.isArray(id)
      ? deleteResult.affected === id.length // 批量删除需要全部成功
      : (deleteResult.affected ?? 0) > 0; // 单个删除只要影响行数>0
  }

  /**
   * 查询所有记录
   *
   * 该方法实现了分页查询记录的功能:
   * 1. 参数说明:
   *    - query: TypeORM的查询条件,可以是单个条件对象或条件数组,可选参数
   *    - limitOptions: 分页选项,包含:
   *      * limit: 每页记录数,默认100
   *      * offset: 偏移量,默认0
   *
   * 2. 实现细节:
   *    - 使用presetWhereOptions预处理查询条件
   *    - 如果query为空则使用空对象{}作为条件
   *    - 通过take和skip参数实现分页
   *    - take对应limitOptions.limit
   *    - skip对应limitOptions.offset
   *
   * 3. 返回值:
   *    - 返回Promise<ENTITY[]>类型
   *    - 包含符合条件的实体数组
   *
   * @param query - 查询条件,可选
   * @param limitOptions - 分页选项,默认每页100条,从0开始
   * @returns 返回实体数组的Promise
   */
  override findAll(
    query?: FindOptionsWhere<ENTITY> | Array<FindOptionsWhere<ENTITY>>,
    limitOptions: LimitOptions = {
      limit: 100,
      offset: 0,
    }
  ): Promise<ENTITY[]> {
    return this.typeormRepository.find({
      where: this.presetWhereOptions(query || {}),
      take: limitOptions.limit,
      skip: limitOptions.offset,
    });
  }

  /**
   * 根据查询条件更新记录
   *
   * 该方法实现了按条件批量更新记录的功能:
   * 1. 参数说明:
   *    - fields: 要更新的字段对象,排除了自动生成字段
   *    - query: TypeORM的查询条件对象
   *
   * 2. 类型构造:
   *    - Partial<Omit<ENTITY, AUTO_GENERATED_FIELDS>>:
   *      排除自动生成字段后的实体类型,所有字段都是可选的
   *    - FindOptionsWhere<ENTITY>:
   *      TypeORM的查询条件类型
   *
   * 3. 实现细节:
   *    - 使用presetWhereOptions预处理查询条件
   *    - 调用typeormRepository.update执行更新
   *    - 返回受影响的记录数
   *
   * 4. 返回值:
   *    - 返回更新影响的记录数
   *    - 使用??运算符处理undefined情况
   *
   * @param fields - 要更新的字段
   * @param query - 查询条件
   * @returns 返回更新的记录数
   */
  override async updateByQuery(
    fields: Partial<Omit<ENTITY, AUTO_GENERATED_FIELDS>>,
    query: FindOptionsWhere<ENTITY>
  ): Promise<number> {
    const result = await this.typeormRepository.update(
      this.presetWhereOptions(query) as FindOptionsWhere<ENTITY>,
      fields as unknown as QueryDeepPartialEntity<ENTITY>
    );

    return result.affected ?? 0;
  }

  /**
   * 部分更新方法
   *
   * 该方法提供了两个重载:
   * 1. 更新单个实体
   * 2. 更新实体数组
   *
   * 类型参数说明:
   * - ENTITY: 实体类型
   * - AUTO_GENERATED_FIELDS: 自动生成的字段(如id等)
   * - FIELDS_REQUIRED_FOR_UPDATE: 更新时必需的字段
   *
   * 类型构造说明:
   * - Partial<Omit<ENTITY, AUTO_GENERATED_FIELDS>>:
   *   排除自动生成字段后的实体类型,所有字段都是可选的
   * - Pick<ENTITY, FIELDS_REQUIRED_FOR_UPDATE>:
   *   必须包含更新必需字段
   *
   * 实现细节:
   * - 内部调用save方法执行实际的更新操作
   * - 支持单个实体和批量操作
   * - 返回更新后的实体对象
   *
   * @param entities - 要更新的实体或实体数组
   * @returns 返回更新后的实体或实体数组的Promise
   */
  updatePartial(
    entity: Partial<Omit<ENTITY, AUTO_GENERATED_FIELDS>> &
      Pick<ENTITY, FIELDS_REQUIRED_FOR_UPDATE>
  ): Promise<Partial<ENTITY>>;

  updatePartial(
    entities: Array<
      Partial<Omit<ENTITY, AUTO_GENERATED_FIELDS>> &
        Pick<ENTITY, FIELDS_REQUIRED_FOR_UPDATE>
    >
  ): Promise<Array<Partial<ENTITY>>>;

  override async updatePartial(
    entities:
      | (Partial<Omit<ENTITY, AUTO_GENERATED_FIELDS>> &
          Pick<ENTITY, FIELDS_REQUIRED_FOR_UPDATE>)
      | Array<
          Partial<Omit<ENTITY, AUTO_GENERATED_FIELDS>> &
            Pick<ENTITY, FIELDS_REQUIRED_FOR_UPDATE>
        >
  ): Promise<Partial<ENTITY> | Array<Partial<ENTITY>>> {
    return this.save(entities);
  }

  /**
   * upsert方法 - 更新或插入实体
   *
   * 该方法提供了两个重载:
   * 1. 更新/插入单个实体
   * 2. 更新/插入实体数组
   *
   * 类型参数说明:
   * - ENTITY: 实体类型
   * - AUTO_GENERATED_FIELDS: 自动生成的字段(如id等)
   * - FIELDS_REQUIRED_FOR_UPDATE: 更新时必需的字段
   *
   * 类型构造说明:
   * - Omit<ENTITY, AUTO_GENERATED_FIELDS | FIELDS_REQUIRED_FOR_UPDATE>:
   *   排除自动生成字段和更新必需字段
   * - Partial<Never<Pick<ENTITY, FIELDS_REQUIRED_FOR_UPDATE>>>:
   *   更新必需字段可选,但必须为never类型
   * - Pick<ENTITY, FIELDS_REQUIRED_FOR_UPDATE>:
   *   必须包含更新必需字段
   *
   * 实现细节:
   * - 内部调用save方法执行实际的更新/插入操作
   * - 支持单个实体和批量操作
   * - 返回保存后的完整实体对象
   *
   * @param entities - 要更新或插入的实体或实体数组
   * @returns 返回保存的实体或实体数组的Promise
   */
  upsert(
    entity:
      | (Omit<ENTITY, AUTO_GENERATED_FIELDS | FIELDS_REQUIRED_FOR_UPDATE> &
          Partial<Never<Pick<ENTITY, FIELDS_REQUIRED_FOR_UPDATE>>>)
      | (Omit<ENTITY, AUTO_GENERATED_FIELDS | FIELDS_REQUIRED_FOR_UPDATE> &
          Pick<ENTITY, FIELDS_REQUIRED_FOR_UPDATE>)
  ): Promise<ENTITY>;

  upsert(
    entities: Array<
      | (Omit<ENTITY, AUTO_GENERATED_FIELDS | FIELDS_REQUIRED_FOR_UPDATE> &
          Partial<Never<Pick<ENTITY, FIELDS_REQUIRED_FOR_UPDATE>>>)
      | (Omit<ENTITY, AUTO_GENERATED_FIELDS | FIELDS_REQUIRED_FOR_UPDATE> &
          Pick<ENTITY, FIELDS_REQUIRED_FOR_UPDATE>)
    >
  ): Promise<ENTITY[]>;

  override async upsert(
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
          Pick<ENTITY, FIELDS_REQUIRED_FOR_UPDATE>)
  ): Promise<ENTITY | ENTITY[]> {
    return this.save(entities);
  }

  /**
   * 创建实体方法
   *
   * 该方法提供了两个重载:
   * 1. 创建单个实体
   * 2. 创建实体数组
   *
   * 类型参数说明:
   * - ENTITY: 实体类型
   * - AUTO_GENERATED_FIELDS: 自动生成的字段(如id等)
   * - ID: 实体的ID字段类型
   *
   * 类型构造说明:
   * - Omit<ENTITY, AUTO_GENERATED_FIELDS>:
   *   排除自动生成字段,因为创建时不需要这些字段
   * - Partial<Pick<ENTITY, ID>>:
   *   ID字段可选,允许创建时不指定ID
   *
   * 实现细节:
   * - 内部调用save方法执行实际的创建操作
   * - 支持单个实体和批量创建
   * - 返回创建后的完整实体对象
   *
   * @param entities - 要创建的实体或实体数组
   * @returns 返回创建的实体或实体数组的Promise
   */
  create(
    entity: Omit<ENTITY, AUTO_GENERATED_FIELDS> & Partial<Pick<ENTITY, ID>>
  ): Promise<ENTITY>;

  create(
    entities: Array<
      Omit<ENTITY, AUTO_GENERATED_FIELDS> & Partial<Pick<ENTITY, ID>>
    >
  ): Promise<Array<ENTITY>>;

  override create(
    entities:
      | (Omit<ENTITY, AUTO_GENERATED_FIELDS> & Partial<Pick<ENTITY, ID>>)
      | Array<Omit<ENTITY, AUTO_GENERATED_FIELDS> & Partial<Pick<ENTITY, ID>>>
  ): Promise<ENTITY | ENTITY[]> {
    return this.save(entities);
  }

  /**
   * 更新实体方法
   *
   * 该方法提供了两个重载:
   * 1. 更新单个实体
   * 2. 更新实体数组
   *
   * 类型参数说明:
   * - ENTITY: 实体类型
   * - AUTO_GENERATED_FIELDS: 自动生成的字段(如id等)
   * - FIELDS_REQUIRED_FOR_UPDATE: 更新时必需的字段
   *
   * 实现细节:
   * - 使用 Omit 排除自动生成字段
   * - 使用 Pick 确保包含必需字段
   * - 内部调用 save 方法执行实际的更新操作
   *
   * @param entity - 要更新的实体或实体数组
   * @returns 返回更新后的实体或实体数组的Promise
   */
  update(
    entity: Omit<ENTITY, AUTO_GENERATED_FIELDS> &
      Pick<ENTITY, FIELDS_REQUIRED_FOR_UPDATE>
  ): Promise<ENTITY>;

  update(
    entities: Array<
      Omit<ENTITY, AUTO_GENERATED_FIELDS> &
        Pick<ENTITY, FIELDS_REQUIRED_FOR_UPDATE>
    >
  ): Promise<Array<ENTITY>>;

  override update(
    entity:
      | Array<
          Omit<ENTITY, AUTO_GENERATED_FIELDS> &
            Pick<ENTITY, FIELDS_REQUIRED_FOR_UPDATE>
        >
      | (Omit<ENTITY, AUTO_GENERATED_FIELDS> &
          Pick<ENTITY, FIELDS_REQUIRED_FOR_UPDATE>)
  ): Promise<ENTITY | ENTITY[]> {
    return this.save(entity);
  }

  /**
   * 获取实体名称
   * @returns 返回实体名称
   */
  override entityName(): string {
    return this.entityTarget.name;
  }

  /**
   * 保存实体的内部方法
   *
   * 该方法用于将实体保存到数据库中,支持单个实体或实体数组的保存。
   *
   * 实现步骤:
   * 1. 将输入统一转换为数组格式,方便统一处理
   * 2. 使用 typeormRepository.create() 创建实体实例
   * 3. 使用 typeormRepository.save() 保存到数据库
   * 4. 根据输入类型返回单个实体或实体数组
   *
   * @param entities - 要保存的实体或实体数组
   * @returns 返回保存后的实体或实体数组
   */
  protected async save(entities: unknown): Promise<ENTITY | ENTITY[]> {
    // 统一转换为数组格式,便于处理
    const toSave = Array.isArray(entities) ? entities : [entities];

    // 先创建实体实例,再保存到数据库
    const saved = await this.typeormRepository.save(
      this.typeormRepository.create(toSave as DeepPartial<ENTITY>[])
    );

    // 根据输入类型返回对应格式
    return Array.isArray(entities) ? saved : saved[0];
  }
}
