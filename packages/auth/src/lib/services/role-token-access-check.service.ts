import { RolesBaseJwtPayload } from '../vo/payload';
import { RoleType } from '../vo/role-type';
import { AbstractRoleAccessCheckService } from './role-access-check.service';

/**
 * 基于令牌的角色访问检查服务
 *
 * 该服务继承自AbstractRoleAccessCheckService，用于检查JWT令牌中的角色权限。
 * 使用RolesBaseJwtPayload<RoleType>作为泛型参数，表示处理带有角色信息的JWT载荷。
 */
export class RoleTokenAccessCheckService extends AbstractRoleAccessCheckService<
  RolesBaseJwtPayload<RoleType>
> {
  /**
   * 检查用户是否具有所有指定角色
   *
   * @param roles - 需要检查的角色类型数组
   * @param jwtPayload - JWT令牌载荷，包含用户角色信息
   * @returns 如果用户具有所有指定角色返回true，否则返回false
   *
   * 处理流程:
   * 1. 检查payload中的roles是否存在，不存在则记录警告日志
   * 2. 从payload中提取用户角色类型并转换为Set集合
   * 3. 检查是否每个指定角色都在用户角色集合中
   */
  public override async hasEach(
    roles: RoleType[],
    jwtPayload: RolesBaseJwtPayload<RoleType>,
  ): Promise<boolean> {
    if (jwtPayload.roles === null || jwtPayload.roles === undefined) {
      this.logger.warn(
        `RoleTokenAccessCheckService.hasEach: JwtPayload doesn't have any roles, it can be related to some misconfiguration`,
      );
    }

    const userRoleTypes = new Set(
      jwtPayload?.roles?.map((role) => role.roleType),
    );
    return roles.every((role) => userRoleTypes.has(role));
  }

  /**
   * 检查用户是否具有任一指定角色
   *
   * @param roles - 需要检查的角色类型数组
   * @param jwtPayload - JWT令牌载荷，包含用户角色信息
   * @returns 如果用户具有任一指定角色返回true，否则返回false
   *
   * 处理流程:
   * 1. 检查payload中的roles是否存在，不存在则记录警告日志
   * 2. 从payload中提取用户角色类型并转换为Set集合
   * 3. 查找是否存在任一指定角色在用户角色集合中
   */
  public override async hasAny(
    roles: RoleType[],
    jwtPayload: RolesBaseJwtPayload<RoleType>,
  ): Promise<boolean> {
    if (jwtPayload.roles === null || jwtPayload.roles === undefined) {
      this.logger.warn(
        `RoleTokenAccessCheckService.hasAny: JwtPayload doesn't have any roles, it can be related to some misconfiguration`,
      );
    }

    const userRoleTypes = new Set(
      jwtPayload?.roles?.map((role) => role.roleType),
    );
    const anyRole = roles.find((role) => userRoleTypes.has(role));
    return anyRole !== undefined;
  }
}
