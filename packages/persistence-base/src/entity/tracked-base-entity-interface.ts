import { IBaseEntity } from './base-entity-interface';
/**
 * 可追踪的基础实体接口
 *
 * 该接口继承自IBaseEntity,为实体提供时间追踪功能:
 * 1. 记录实体的创建时间
 * 2. 记录实体的更新时间
 * 3. 支持软删除,记录删除时间
 *
 * 字段说明:
 * - createdAt: 创建时间
 * - updatedAt: 最后更新时间
 * - deletedAt: 删除时间(可选),用于软删除
 *
 * 使用场景:
 * - 需要追踪数据变更历史
 * - 实现数据软删除
 * - 审计日志记录
 */
export interface ITrackedBaseEntity extends IBaseEntity {
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
