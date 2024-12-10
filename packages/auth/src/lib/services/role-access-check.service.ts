import { GeneralInternalServerException } from '@aiofc/exceptions';
import { Logger } from '@nestjs/common';
import { IAccessTokenPayload } from '../vo/payload';
import { RoleCheckMode } from '../decorators/role.decorator';

/**
 * 抽象角色访问检查服务
 *
 * 该服务用于检查用户是否具有所需的角色。使用泛型支持自定义访问令牌载荷类型:
 * - T: 访问令牌载荷类型,继承自IAccessTokenPayload
 *
 * 实现原理:
 * 1. 定义抽象类规范角色检查接口
 * 2. 提供hasEach和hasAny两种角色检查方式
 * 3. 通过checkRoles方法统一处理角色检查逻辑
 */
export abstract class AbstractRoleAccessCheckService<
  T extends IAccessTokenPayload,
> {
  /**
   * 用于记录日志的Logger实例
   */
  protected logger: Logger = new Logger(AbstractRoleAccessCheckService.name);

  /**
   * 检查是否具有所有指定角色
   * @param roles 角色列表
   * @param jwtPayload JWT载荷
   */
  abstract hasEach(roles: string[], jwtPayload: T): Promise<boolean>;

  /**
   * 检查是否具有任一指定角色
   * @param roles 角色列表
   * @param jwtPayload JWT载荷
   */
  abstract hasAny(roles: string[], jwtPayload: T): Promise<boolean>;

  /**
   * 统一的角色检查方法
   *
   * @param checkMode - 角色检查模式,可以是ANY(任一角色)或EACH(所有角色)
   * @param jwtPayload - JWT令牌的payload数据
   * @param roles - 需要检查的角色列表
   * @returns Promise<boolean> - 是否具有所需角色
   * @throws GeneralInternalServerException - 当遇到未知的检查模式时抛出
   *
   * 处理流程:
   * 1. 首先检查角色列表是否为空,如果为空直接返回false
   * 2. 根据checkMode选择对应的角色检查方式:
   *    - ANY模式: 调用hasAny()检查是否具有任一角色
   *    - EACH模式: 调用hasEach()检查是否具有所有角色
   * 3. 如果是未知的检查模式:
   *    - 记录错误日志
   *    - 抛出内部服务器错误
   */
  public async checkRoles(
    checkMode: RoleCheckMode,
    jwtPayload: T,
    roles?: string[],
  ) {
    if (roles === undefined || roles.length === 0) {
      return false;
    }

    switch (checkMode) {
      case RoleCheckMode.ANY: {
        return this.hasAny(roles, jwtPayload);
      }
      case RoleCheckMode.EACH: {
        return this.hasEach(roles, jwtPayload);
      }
      default: {
        this.logger.error(`Unknown role check mode: ${checkMode}.
        Seems like someone added new role method but forgot to handle it`);

        throw new GeneralInternalServerException();
      }
    }
  }
}
