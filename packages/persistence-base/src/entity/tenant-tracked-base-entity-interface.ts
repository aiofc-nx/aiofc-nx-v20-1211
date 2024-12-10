import { ITenantBaseEntity } from './tenant-base-entity-interface';
import { ITrackedBaseEntity } from './tracked-base-entity-interface';

/**
 * 租户可追踪基础实体接口
 *
 * 该接口通过继承两个基础接口来组合功能:
 * 1. ITenantBaseEntity: 提供租户相关的功能
 *    - tenantId: 租户标识字段
 *
 * 2. ITrackedBaseEntity: 提供数据追踪功能
 *    - createdAt: 创建时间
 *    - updatedAt: 更新时间
 *    - deletedAt: 删除时间(可选)
 *
 * 使用场景:
 * - 需要同时支持多租户和数据追踪的实体
 * - 实现租户数据隔离和变更历史记录
 * - 适用于大多数业务实体的基础接口
 */
export interface ITenantTrackedBaseEntity
  extends ITenantBaseEntity,
    ITrackedBaseEntity {}
