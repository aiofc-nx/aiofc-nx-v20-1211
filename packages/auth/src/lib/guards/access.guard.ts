import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  Optional,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GeneralInternalServerException } from '@aiofc/exceptions';
import { AbstractAccessCheckService } from '../services/access-check.service';
import { PermissionCheckMode } from '../decorators/permission.decorator';
import {
  IAccessTokenPayload,
  IAccessTokenPayloadWithTenantsInfo,
} from '../vo/payload';
import { UserClsStore } from '../vo/user-cls-store';
import { RoleCheckMode } from '../decorators/role.decorator';
import { AbstractRoleAccessCheckService } from '../services/role-access-check.service';
import { ClsService } from '@aiofc/nestjs-cls';
/**
 * AccessGuard 守卫
 * 用于检查用户是否具有访问资源所需的权限和角色
 *
 * 实现原理:
 * 1. 通过 reflector 获取路由上的权限和角色元数据
 * 2. 支持权限检查(通过 accessCheckService)和角色检查(通过 roleAccessCheckService)
 * 3. 可配置权限和角色的检查模式(ANY/EACH)
 * 4. 使用 ClsService 存储请求上下文中的用户信息
 *
 * 使用示例:
 * @UseGuards(AccessGuard)
 * @Permissions('read:users')
 * @Roles('admin')
 * async getUsers() {
 *   // ...
 * }
 */

@Injectable()
export class AccessGuard implements CanActivate {
  private readonly logger: Logger = new Logger(AccessGuard.name);

  /**
   * AccessGuard 构造函数
   *
   * @param reflector - Reflector 实例,用于获取路由上的元数据
   * @param clsService - ClsService 实例,用于存储请求上下文中的用户信息
   *                     泛型参数指定了用户信息的类型为 UserClsStore<IAccessTokenPayloadWithTenantsInfo<unknown>>
   * @param accessCheckService - 可选的权限检查服务,用于检查用户是否具有所需权限
   *                            继承自 AbstractAccessCheckService
   * @param roleAccessCheckService - 可选的角色检查服务,用于检查用户是否具有所需角色
   *                                继承自 AbstractRoleAccessCheckService
   */
  constructor(
    private reflector: Reflector,
    private clsService: ClsService<
      UserClsStore<IAccessTokenPayloadWithTenantsInfo<unknown>>
    >,
    @Optional()
    private accessCheckService?: AbstractAccessCheckService<IAccessTokenPayload>,
    @Optional()
    private roleAccessCheckService?: AbstractRoleAccessCheckService<IAccessTokenPayload>,
  ) {}


  /**
   * 检查用户是否有权限访问资源的主要方法
   * @param context ExecutionContext - NestJS执行上下文对象
   * @returns Promise<boolean> - 返回是否有权限访问
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    /**
     * 从上下文中获取权限和角色相关的元数据
     * permissions: 需要的权限列表
     * checkMode: 权限检查模式
     * roles: 需要的角色列表
     * roleCheckMode: 角色检查模式
     */
    const [permissions, checkMode] = this.getPermissionsMetadata(context);
    const [roles, roleCheckMode] = this.getRolesMetadata(context);

    /**
     * 如果没有设置任何权限和角色要求,说明这是一个仅需要认证的端点
     * 直接返回true允许访问
     */
    if (permissions.length === 0 && roles.length === 0) {
      return true;
    }

    /**
     * 从请求中获取用户信息
     */
    const { user } = context.switchToHttp().getRequest();

    /**
     * 如果用户信息不存在,说明开发配置有误:
     * 1. 控制器可能跳过了认证
     * 2. 但方法上应用了权限或角色装饰器
     * 这种情况下抛出服务器内部错误
     */
    if (!user) {
      this.logger.error(
        `Seems like a developer mistake. User is not defined, meaning that
        the controller is most likely skipped for auth, but permission guard is applied
        to controller method. Please check if the controller is decorated with @SkipAuth(),
        and if the method is decorated with @Permissions() or @Roles()`,
      );
      throw new GeneralInternalServerException();
    }

    /**
     * 权限检查流程:
     * 1. 首先检查JWT中的角色(无需数据库查询)
     * 2. 如果1失败,通过roleAccessCheckService检查角色
     * 3. 如果2失败,通过accessCheckService检查具体权限
     * 4. 如果以上都失败,返回false表示无权限
     */
    const rolesMatch = await this.checkRoles(user, roles);
    return (
      rolesMatch ||
      (await this.roleAccessCheckService?.checkRoles(
        roleCheckMode,
        user,
        roles,
      )) ||
      (await this.accessCheckService?.checkPermissions(
        checkMode as PermissionCheckMode,
        user,
        permissions as unknown as string[],
      )) ||
      false
    );
  }

  /**
   * 获取角色元数据
   *
   * 实现原理:
   * 1. 使用reflector从当前执行上下文获取roles元数据
   * 2. 返回角色数组和检查模式的元组
   * 3. 如果未设置元数据则返回默认值[[], RoleCheckMode.ANY]
   *
   * 参数说明:
   * @param context - 执行上下文对象
   * @returns [string[], RoleCheckMode] - 返回[角色数组, 检查模式]的元组
   */
  private getRolesMetadata(
    context: ExecutionContext,
  ): [string[], RoleCheckMode] {
    return (
      this.reflector.get<[string[], RoleCheckMode]>(
        'roles',
        context.getHandler(),
      ) || [[], RoleCheckMode.ANY]
    );
  }

  /**
   * 获取权限元数据
   *
   * 实现原理:
   * 1. 使用reflector从当前执行上下文获取permissions元数据
   * 2. 如果未设置元数据则返回默认值[[]]
   *
   * 参数说明:
   * @param context - 执行上下文对象
   * @returns [string[], PermissionCheckMode, PresenceType] - 返回[权限数组,检查模式,权限范围]的元组
   */
  private getPermissionsMetadata(context: ExecutionContext) {
    return (
      this.reflector.get<string[]>('permissions', context.getHandler()) || [[]]
    );
  }

  /**
   * 检查用户角色权限
   *
   * 实现原理:
   * 1. 检查是否有需要验证的角色列表
   * 2. 从 CLS 中获取当前租户 ID
   * 3. 查找用户在当前租户下的角色信息
   * 4. 验证用户是否拥有所需角色中的任意一个
   *
   * 参数说明:
   * @param user - 当前用户信息,包含租户和角色数据
   * @param acceptableRoles - 允许访问的角色列表
   * @returns Promise<boolean> - 返回是否有权限访问
   */
  private async checkRoles(
    user: IAccessTokenPayloadWithTenantsInfo<unknown>,
    acceptableRoles?: string[],
  ): Promise<boolean> {
    if (acceptableRoles === undefined || acceptableRoles.length === 0) {
      return false;
    }

    const currentTenant = this.clsService.get().tenantId;

    const tenantInfo = user?.tenants?.find(
      (tenant) => tenant.tenantId === currentTenant,
    );

    if (tenantInfo === undefined) {
      return false;
    }

    return tenantInfo.roles.some((r) =>
      r.roleType ? acceptableRoles.includes(r.roleType?.toString()) : false,
    );
  }
}
