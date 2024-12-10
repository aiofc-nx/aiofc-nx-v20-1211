import { Logger } from '@nestjs/common';
import { GeneralInternalServerException } from '@aiofc/exceptions';
import { PermissionCheckMode } from '../decorators/permission.decorator';
import { IAccessTokenPayload } from '../vo/payload';

/**
 * 抽象访问检查服务
 *
 * 该服务用于检查用户是否具有所需的权限。使用泛型支持自定义访问令牌载荷类型:
 * - T: 访问令牌载荷类型,继承自IAccessTokenPayload
 *
 * 实现原理:
 * 1. 定义抽象类规范权限检查接口
 * 2. 提供hasEach和hasAny两种权限检查方式
 * 3. 通过checkPermissions方法统一处理权限检查逻辑
 *
 * 使用示例:
 * class MyAccessCheck extends AbstractAccessCheckService {
 *   hasEach(permissions, payload) {
 *     // 实现每个权限都需要的检查逻辑
 *   }
 *   hasAny(permissions, payload) {
 *     // 实现任一权限即可的检查逻辑
 *   }
 * }
 */
export abstract class AbstractAccessCheckService<
  T extends IAccessTokenPayload,
> {
  /**
   * 用于记录日志的Logger实例
   */
  protected logger: Logger = new Logger(AbstractAccessCheckService.name);

  /**
   * 检查是否具有所有指定权限
   * @param permissions 权限列表
   * @param jwtPayload JWT载荷
   */
  abstract hasEach(permissions: string[], jwtPayload: T): Promise<boolean>;

  /**
   * 检查是否具有任一指定权限
   * @param permissions 权限列表
   * @param jwtPayload JWT载荷
   */
  abstract hasAny(permissions: string[], jwtPayload: T): Promise<boolean>;

  /**
   * 统一的权限检查方法
   *
   * @param checkMode - 权限检查模式,可以是ANY(任一权限)或EACH(所有权限)
   * @param jwtPayload - JWT令牌的payload数据
   * @param permissions - 需要检查的权限列表
   * @returns Promise<boolean> - 是否具有所需权限
   * @throws GeneralInternalServerException - 当遇到未知的检查模式时抛出
   *
   * 处理流程:
   * 1. 首先检查权限列表是否为空,如果为空直接返回false
   * 2. 根据checkMode选择对应的权限检查方式:
   *    - ANY模式: 调用hasAny()检查是否具有任一权限
   *    - EACH模式: 调用hasEach()检查是否具有所有权限
   * 3. 如果是未知的检查模式:
   *    - 记录错误日志
   *    - 抛出内部服务器错误
   */
  public async checkPermissions(
    checkMode: PermissionCheckMode,
    jwtPayload: T,
    permissions?: string[],
  ) {
    if (permissions === undefined || permissions.length === 0) {
      return false;
    }

    switch (checkMode) {
      case PermissionCheckMode.ANY: {
        return this.hasAny(permissions, jwtPayload);
      }
      case PermissionCheckMode.EACH: {
        return this.hasEach(permissions, jwtPayload);
      }
      default: {
        this.logger.error(`Unknown permission check mode: ${checkMode}.
        Seems like someone added new permission method but forgot to handle it`);

        throw new GeneralInternalServerException();
      }
    }
  }
}
