import { AbstractAccessCheckService } from './access-check.service';
import { PermissionsBaseJwtPayload } from '../vo/payload';

/**
 * 基于令牌的权限访问检查服务
 *
 * 该服务继承自AbstractAccessCheckService，用于检查JWT令牌中的权限。
 * 使用PermissionsBaseJwtPayload作为泛型参数，表示处理带有权限信息的JWT载荷。
 */
export class TokenAccessCheckService extends AbstractAccessCheckService<PermissionsBaseJwtPayload> {
  /**
   * 检查用户是否具有所有指定权限
   *
   * @param permissions - 需要检查的权限列表
   * @param jwtPayload - JWT令牌载荷，包含用户权限信息
   * @returns 如果用户具有所有指定权限返回true，否则返回false
   *
   * 处理流程:
   * 1. 检查payload中的permissions是否存在，不存在则记录警告日志
   * 2. 将用户权限转换为Set集合便于查找
   * 3. 检查是否每个指定权限都在用户权限集合中
   */
  public override async hasEach(
    permissions: string[],
    jwtPayload: PermissionsBaseJwtPayload,
  ): Promise<boolean> {
    if (
      jwtPayload.permissions === null ||
      jwtPayload.permissions === undefined
    ) {
      this.logger.warn(
        `TokenAccessCheckService.hasEach: JwtPayload doesn't have any permissions, it can be related to some misconfiguration`,
      );
    }

    const userPermissions = new Set(jwtPayload.permissions || []);
    return permissions.every((permission) => userPermissions.has(permission));
  }

  /**
   * 检查用户是否具有任一指定权限
   *
   * @param permissions - 需要检查的权限列表
   * @param jwtPayload - JWT令牌载荷，包含用户权限信息
   * @returns 如果用户具有任一指定权限返回true，否则返回false
   *
   * 处理流程:
   * 1. 检查payload中的permissions是否存在，不存在则记录警告日志
   * 2. 将用户权限转换为Set集合便于查找
   * 3. 查找是否存在任一指定权限在用户权限集合中
   */
  public override async hasAny(
    permissions: string[],
    jwtPayload: PermissionsBaseJwtPayload,
  ): Promise<boolean> {
    if (
      jwtPayload.permissions === null ||
      jwtPayload.permissions === undefined
    ) {
      this.logger.warn(
        `TokenAccessCheckService.hasAny: JwtPayload doesn't have any permissions, it can be related to some misconfiguration`,
      );
    }

    const userPermissions = new Set(jwtPayload.permissions || []);
    const anyPermission = permissions.find((permission) =>
      userPermissions.has(permission),
    );
    return anyPermission !== undefined;
  }
}
