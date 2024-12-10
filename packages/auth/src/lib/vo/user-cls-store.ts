import { TenantClsStore } from '@aiofc/persistence-base';
import { IAccessTokenPayload } from './payload';

/**
 * 用户上下文存储接口
 *
 * 该接口定义了用户请求上下文中需要存储的信息。继承自TenantClsStore,
 * 使用泛型T来支持不同类型的JWT载荷。
 *
 * 包含的字段:
 * - jwtPayload: JWT令牌载荷,类型为泛型T
 * - reqId: 请求ID,用于追踪请求
 * - userId: 用户ID
 * - authHeader: 认证头信息
 */
export interface UserClsStore<T extends IAccessTokenPayload>
  extends TenantClsStore {
  jwtPayload: T;
  reqId: string;
  userId: string;
  authHeader: string;
}
