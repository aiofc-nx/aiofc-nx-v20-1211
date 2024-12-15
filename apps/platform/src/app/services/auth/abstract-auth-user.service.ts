import { Maybe } from '@aiofc/common-types';
import { BaseSignUpByEmailRequest } from '../../controllers/auth/vo/sign-up.dto';
import { JwtTokensPayload } from '@aiofc/auth';
import { ExternalApproval, UserProfile, UserRole } from '@aiofc/entities';

/**
 * 这个抽象类定义了处理用户认证的相关方法，但是并没有实现这些方法
 * 而是作为Token，指向具体实现这些方法的是 AuthUserService（auth-user.service.ts）
 * {
      provide: AbstractAuthUserService,
      useClass: AuthUserService,
    }
 */
export default abstract class AbstractAuthUserService {
  /**
   * 通过邮箱查找用户
   *
   * @param email - 用户邮箱地址
   * @returns 返回用户档案信息,如果未找到则返回null/undefined
   */
  public abstract findUserByEmail(email: string): Promise<Maybe<UserProfile>>;

  /**
   * 通过邮箱创建用户
   *
   * @param signUpByEmailRequest - 用户注册请求参数,包含:
   *   - email: 邮箱地址
   *   - password: 密码
   *   - firstName: 名
   *   - lastName: 姓
   *   等基本信息
   *
   * @returns 返回包含以下内容的对象:
   *   - user: 创建的用户档案信息
   *   - externalApproval: 外部审批信息,用于邮箱验证等流程
   */
  public abstract createUserByEmail(
    signUpByEmailRequest: BaseSignUpByEmailRequest
  ): Promise<{
    user: UserProfile;
    externalApproval: ExternalApproval;
  }>;

  /**
   * 通过SSO创建用户
   *
   * @param tenantId - 租户ID,指定用户所属租户
   * @param email - 用户邮箱地址
   * @param firstName - 用户名
   * @param lastName - 用户姓
   * @param roles - 用户角色列表,定义用户权限
   * @param userProfileId - 可选的用户档案ID,用于关联已有用户档案
   *
   * @returns 返回JWT令牌载荷,包含:
   *   - accessToken: 访问令牌
   *   - refreshToken: 刷新令牌
   */
  public abstract createSsoUser(
    tenantId: string,
    email: string,
    firstName: string,
    lastName: string,
    roles: UserRole[],
    userProfileId?: string
  ): Promise<JwtTokensPayload>;

  /**
   * 保存用户的刷新令牌
   *
   * @param userId - 用户ID
   * @param token - 刷新令牌字符串
   *
   * @returns void - 保存操作完成的Promise
   */
  public abstract saveRefreshToken(
    userId: string,
    token: string
  ): Promise<void>;

  /**
   * 批准用户注册
   *
   * @param approveId - 审批ID,标识待审批的注册请求
   * @param code - 验证码,验证注册请求的合法性
   *
   * @returns boolean - 表示审批是否成功
   */
  public abstract approveSignUp(
    approveId: string,
    code: string
  ): Promise<boolean>;
}
