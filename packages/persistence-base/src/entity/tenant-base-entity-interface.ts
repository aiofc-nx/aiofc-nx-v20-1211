import { IBaseEntity } from './base-entity-interface';
/**
 * 租户基础实体接口
 *
 * 该接口继承自IBaseEntity,为租户相关的实体提供基础结构:
 * 1. 通过继承IBaseEntity获得基础实体的通用属性
 * 2. 添加tenantId字段用于多租户数据隔离
 * 3. 作为所有租户相关实体的基础接口
 *
 * 字段说明:
 * - tenantId: 租户ID,用于标识数据所属的租户
 *
 * 使用场景:
 * - 作为租户相关实体的基础接口
 * - 实现多租户数据隔离
 * - 统一租户实体的结构
 */
export interface ITenantBaseEntity extends IBaseEntity {
  tenantId: string;
}

