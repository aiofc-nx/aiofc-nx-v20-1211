import { FastifyRequest } from 'fastify';
import { IAccessTokenPayload } from '../vo/payload';

/**
 * 抽象租户解析服务
 * 用于处理多租户系统中的租户识别和验证
 *
 * 实现原理:
 * 1. 定义抽象类以规范租户解析的接口规范
 * 2. 支持从请求中解析租户ID
 * 3. 支持验证用户是否属于指定租户
 * 4. 使用泛型参数PAYLOAD继承IAccessTokenPayload以支持自定义JWT载荷类型
 *
 * 使用示例:
 * class MyTenantService extends AbstractTenantResolutionService {
 *   async resolveTenantId(req, payload) {
 *     // 实现租户ID解析逻辑
 *   }
 *   async verifyUserBelongToTenant(tenantId, payload) {
 *     // 实现租户归属验证逻辑
 *   }
 * }
 */
export abstract class AbstractTenantResolutionService<
  PAYLOAD extends IAccessTokenPayload,
> {
  /**
   * 从请求中解析租户ID
   *
   * 实现说明:
   * 1. 支持从请求参数、请求头等位置获取租户标识
   * 2. JWT payload参数可选,因为某些场景可能不需要认证
   * 3. 返回解析出的租户ID或undefined
   *
   * @param req FastifyRequest - Fastify请求对象
   * @param jwtPayload PAYLOAD - 可选的JWT载荷数据
   * @returns Promise<string | undefined> - 解析出的租户ID
   */
  public abstract resolveTenantId(
    req: FastifyRequest,
    jwtPayload?: PAYLOAD,
  ): Promise<string | undefined>;

  /**
   * 验证用户是否属于指定租户
   *
   * 实现说明:
   * 1. 仅用于已认证用户的租户归属验证
   * 2. 需要同时提供租户ID和JWT载荷
   * 3. 返回布尔值表示用户是否属于该租户
   *
   * @param tenantId string - 租户ID
   * @param jwtPayload PAYLOAD - JWT载荷数据
   * @returns Promise<boolean> - 用户是否属于该租户
   */
  public abstract verifyUserBelongToTenant(
    tenantId: string,
    jwtPayload: PAYLOAD,
  ): Promise<boolean>;
}
