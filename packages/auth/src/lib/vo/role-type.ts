/**
 * 角色类型枚举
 *
 * 定义了系统中的角色类型:
 * - ADMIN: 管理员角色,拥有最高权限
 * - REGULAR: 普通用户角色,拥有基本权限
 * - NOT_USED: 未使用的角色类型,保留字段
 *
 * 该枚举用于:
 * 1. 标识用户角色
 * 2. 进行权限控制
 * 3. 在JWT令牌中携带角色信息
 */
export enum RoleType {
  ADMIN = 'ADMIN',
  REGULAR = 'REGULAR',
  NOT_USED = 'NOT_USED',
}
