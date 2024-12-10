import { SetMetadata } from '@nestjs/common';

/**
 * 角色检查模式枚举
 * EACH - 需要满足所有指定的角色
 * ANY - 满足任意一个指定的角色即可
 */
export enum RoleCheckMode {
  'EACH' = 'EACH', // 需要满足所有角色
  'ANY' = 'ANY', // 满足任意角色即可
}

/**
 * Roles装饰器 - 用于标记访问某个路由或控制器需要的角色权限
 *
 * @param roles - 单个角色或角色数组
 * @param roleCheckMode - 角色检查模式,默认为ANY(满足任意角色即可)
 * @returns 装饰器函数,设置roles元数据
 *
 * 使用示例:
 * @Roles('admin')
 * @Roles(['admin', 'user'], RoleCheckMode.EACH)
 */
export const Roles = <T>(
  roles: T | T[], // 支持传入单个角色或角色数组
  roleCheckMode: RoleCheckMode = RoleCheckMode.ANY, // 默认使用ANY模式
) => {
  // 将单个角色转换为数组形式
  const rolesArray = Array.isArray(roles) ? roles : [roles];
  // 设置roles元数据,包含角色数组和检查模式
  return SetMetadata('roles', [rolesArray, roleCheckMode]);
};
