/**
 * JWT令牌载荷相关接口定义
 *
 * 这些接口定义了系统中使用的各种JWT令牌载荷的数据结构。
 * 包括基础访问令牌、权限令牌、租户令牌、角色令牌等。
 */

/**
 * 基础访问令牌载荷接口
 * 包含用户的基本信息
 */
export interface IAccessTokenPayload {
  sub: string;  // 用户唯一标识
  email: string;  // 用户邮箱
}

/**
 * 基于权限的JWT载荷接口
 * 扩展基础载荷,添加权限列表
 */
export interface PermissionsBaseJwtPayload extends IAccessTokenPayload {
  permissions: string[];  // 用户拥有的权限列表
}

/**
 * 包含多租户信息的访问令牌载荷接口
 * 支持用户在多个租户中拥有不同角色
 */
export interface IAccessTokenPayloadWithTenantsInfo<T>
  extends IAccessTokenPayload {
  tenants: TenantInfo<T>[];  // 用户所属租户信息列表
}

/**
 * 单租户访问令牌载荷接口
 * 用于用户只属于单个租户的场景
 */
export interface IAccessTokenSingleTenantPayload extends IAccessTokenPayload {
  tenantId: string;  // 租户ID
}

/**
 * 基于角色的访问令牌载荷接口
 * 包含用户的角色信息
 */
export interface RoleBasedAccessTokenPayload<T> extends IAccessTokenPayload {
  roles: RoleInfo<T>[];  // 用户角色信息列表
}

/**
 * 刷新令牌载荷接口
 * 继承基础访问令牌载荷,用于刷新访问令牌
 */
export interface IRefreshTokenPayload extends IAccessTokenPayload {}

/**
 * 租户信息接口
 * 描述租户的基本信息和用户在该租户中的角色
 */
export interface TenantInfo<T> {
  tenantId: string;  // 租户ID
  roles: RoleInfo<T>[];  // 用户在该租户中的角色列表
}

/**
 * 角色信息接口
 * 描述角色的基本信息
 */
export interface RoleInfo<T> {
  roleId: string;  // 角色ID
  roleType?: T;  // 角色类型,可选
}

/**
 * 基于角色的JWT载荷接口
 * 扩展基础载荷,添加角色信息
 */
export interface RolesBaseJwtPayload<T> extends IAccessTokenPayload {
  roles: RoleInfo<T>[];  // 用户角色信息列表
}

/**
 * JWT签名信息接口
 * 包含令牌的签发时间和过期时间
 */
export interface PayloadSigned {
  iat: number;  // 签发时间
  exp: number;  // 过期时间
}
