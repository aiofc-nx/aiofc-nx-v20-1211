import { IBaseEntity } from '@aiofc/persistence-base';
import {
  BaseEntity,
} from 'typeorm';
/**
 * BaseEntity 来自于 TypeORM，是所有实体的基本抽象实体，在 ActiveRecord 模式中使用。
 * https://github1s.com/typeorm/typeorm/blob/master/src/repository/BaseEntity.ts
 * TheBaseEntity 即原来的 EntityHelper
 */

/**
 * TypeORM基础实体类
 *
 * 该类通过继承和实现来组合功能:
 * 1. 继承TypeORM的BaseEntity:
 *    - 获得TypeORM提供的基础实体功能
 *    - 支持ActiveRecord模式的操作方法
 *    - 包含save、remove等实体操作方法
 *
 * 2. 实现IBaseEntity接口:
 *    - 满足业务层对基础实体的要求
 *    - 确保实体具有统一的基础结构
 *
 * 使用场景:
 * - 作为所有TypeORM实体的基类
 * - 统一实体的基础功能和结构
 * - 实现ActiveRecord模式的数据访问
 */
export abstract class TypeormBaseEntity extends BaseEntity implements IBaseEntity{}

/*
真正的功能实现从这里开始，通过继承 Typeorm的BaseEntity 获得了 TypeORM 定义的功能
*/