import { IAccessTokenPayload, IRefreshTokenPayload } from '@aiofc/auth';
import { TenantInfo } from './tenant-info';

/**
 * 基础访问令牌载荷接口
 *
 * @description
 * 该接口继承自IAccessTokenPayload,添加了用户的基本信息:
 *
 * 1. firstName - 用户名
 * 2. lastName - 用户姓
 * 3. logoUrl - 可选的用户头像URL
 */
export interface BaseAccessTokenPayload extends IAccessTokenPayload {
  firstName: string;
  lastName: string;
  logoUrl?: string;
}

/**
 * 多租户访问令牌载荷接口
 *
 * @description
 * 该接口继承自AccessTokenPayload,添加了多租户支持:
 *
 * - tenants数组包含用户所属的所有租户信息
 */
export interface MultiTenantAccessTokenPayload extends AccessTokenPayload {
  tenants: TenantInfo[];
}

/**
 * 单租户访问令牌载荷接口
 *
 * @description
 * 该接口同时继承AccessTokenPayload和TenantInfo:
 *
 * - 包含用户基本信息
 * - 直接包含单个租户的信息
 */
export interface SingleTenantAccessTokenPayload
  extends AccessTokenPayload,
    TenantInfo {}

/**
 * 刷新令牌载荷接口
 *
 * @description
 * 继承IRefreshTokenPayload:
 *
 * - 用于刷新访问令牌的载荷信息
 */
export interface RefreshTokenPayload extends IRefreshTokenPayload {}

/**
 * 访问令牌载荷接口
 *
 * @description
 * 继承BaseAccessTokenPayload:
 *
 * - 作为默认的访问令牌载荷实现
 * - 便于在需要时替换具体实现
 */
export interface AccessTokenPayload extends BaseAccessTokenPayload {}
