import { IAccessTokenPayload, IRefreshTokenPayload } from '../vo/payload';
import { JwtTokensPayload } from './vo/jwt-tokens-payload';

/**
 * 抽象令牌构建服务
 *
 * 该服务用于构建JWT令牌的payload数据。使用泛型支持自定义用户类型和令牌载荷类型:
 * - USER: 用户对象类型
 * - ACCESS_TOKEN: 访问令牌载荷类型,继承自IAccessTokenPayload
 * - REFRESH_TOKEN: 刷新令牌载荷类型,继承自IRefreshTokenPayload
 *
 * 实现原理:
 * 1. 定义抽象类规范令牌构建接口
 * 2. 提供访问令牌和刷新令牌的payload构建方法
 * 3. 整合两种令牌payload到一个完整的JwtTokensPayload对象
 *
 * 使用示例:
 * class MyTokenBuilder extends AbstractTokenBuilderService {
 *   buildAccessTokenPayload(user) {
 *     // 实现访问令牌payload构建逻辑
 *   }
 *   buildRefreshTokenPayload(user) {
 *     // 实现刷新令牌payload构建逻辑
 *   }
 * }
 */
export abstract class AbstractTokenBuilderService<
  USER,
  ACCESS_TOKEN extends IAccessTokenPayload,
  REFRESH_TOKEN extends IRefreshTokenPayload,
> {
  /**
   * 构建访问令牌的payload
   * @param user 用户对象
   * @returns 访问令牌payload
   */
  abstract buildAccessTokenPayload(user: USER): ACCESS_TOKEN;

  /**
   * 构建刷新令牌的payload
   * @param user 用户对象
   * @returns 刷新令牌payload
   */
  abstract buildRefreshTokenPayload(user: USER): REFRESH_TOKEN;

  /**
   * 构建完整的JWT令牌payload
   * 整合访问令牌和刷新令牌的payload
   *
   * @param user 用户对象
   * @returns 包含两种令牌payload的完整对象
   */
  public buildTokensPayload(user: USER): JwtTokensPayload {
    return {
      accessTokenPayload: this.buildAccessTokenPayload(user),
      refreshTokenPayload: this.buildRefreshTokenPayload(user),
    };
  }
}
