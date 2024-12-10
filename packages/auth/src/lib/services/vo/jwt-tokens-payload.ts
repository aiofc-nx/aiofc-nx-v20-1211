import { IAccessTokenPayload, IRefreshTokenPayload } from '../../vo/payload';
/**
 * JWT令牌载荷接口
 *
 * 该接口定义了JWT令牌系统中的完整载荷结构,包含:
 * 1. accessTokenPayload - 访问令牌的载荷数据
 *    用于验证用户的访问权限
 *
 * 2. refreshTokenPayload - 刷新令牌的载荷数据
 *    用于在访问令牌过期时获取新的令牌
 *
 * 使用场景:
 * - 在生成JWT令牌时作为载荷模板
 * - 在验证令牌时用于类型检查
 * - 在令牌刷新流程中传递数据
 */
export interface JwtTokensPayload {
  accessTokenPayload: IAccessTokenPayload;
  refreshTokenPayload: IRefreshTokenPayload;
}
