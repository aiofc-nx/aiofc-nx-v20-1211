import { TenantInfo as DefaultTenantInfo, RoleType } from '@aiofc/auth';
/**
 * 租户信息接口
 *
 * @description
 * 该接口继承自DefaultTenantInfo基类:
 *
 * 1. 继承DefaultTenantInfo泛型接口
 * - 使用RoleType作为泛型参数
 * - 定义租户角色类型
 *
 * 2. 主要用途
 * - 存储租户相关信息
 * - 提供类型安全的租户数据访问
 * - 用于租户权限管理
 */
export interface TenantInfo extends DefaultTenantInfo<RoleType> {}
