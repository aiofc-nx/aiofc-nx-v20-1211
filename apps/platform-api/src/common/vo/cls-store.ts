import { AccessTokenPayload } from './token-payload';
import { UserClsStore } from '@aiofc/auth';

/**
 * CLS存储接口
 *
 * @description
 * 该接口继承自UserClsStore,用于存储请求上下文中的用户信息:
 *
 * 1. 继承UserClsStore泛型接口
 * - 使用AccessTokenPayload作为泛型参数
 * - 包含用户令牌载荷信息
 *
 * 2. 主要用途
 * - 在请求生命周期中存储用户上下文
 * - 便于在应用各层访问用户信息
 * - 提供类型安全的用户数据访问
 */
export interface ClsStore extends UserClsStore<AccessTokenPayload> {}
