import { SetMetadata } from '@nestjs/common';

/**
 * 定义权限范围类型
 * OWN: 仅自己的资源
 * ALL: 所有资源
 * GROUP: 组内资源
 * string: 自定义范围
 */
export type PresenceType = 'OWN' | 'ALL' | 'GROUP' | string;

/**
 * 定义权限检查模式枚举
 * EACH: 需要满足所有指定的权限
 * ANY: 满足任一指定的权限即可
 */
export enum PermissionCheckMode {
  'EACH' = 'EACH',
  'ANY' = 'ANY',
}

/**
 * Permissions 装饰器
 * 用于标记访问某个路由或控制器需要的权限
 *
 * 实现原理:
 * 1. 使用 SetMetadata 设置权限相关的元数据
 * 2. 支持传入单个权限或权限数组
 * 3. 可配置权限范围(OWN/ALL/GROUP等)
 * 4. 可配置权限检查模式(ANY/EACH)
 *
 * 参数说明:
 * @param permissions - 权限字符串或权限字符串数组
 * @param presence - 权限范围,默认为'ALL'
 * @param checkMode - 权限检查模式,默认为ANY(满足任意权限即可)
 *
 * 使用示例:
 * @Permissions('read:users')
 * @Permissions(['read:users', 'write:users'], 'GROUP', PermissionCheckMode.EACH)
 */
export const Permissions = (
  permissions: string | string[],
  presence: PresenceType = 'ALL',
  checkMode: PermissionCheckMode = PermissionCheckMode.ANY,
) => {
  // 将单个权限字符串转换为数组形式
  const permissionsArray = Array.isArray(permissions)
    ? permissions
    : [permissions];
  // 设置元数据,包含权限数组、检查模式和权限范围
  return SetMetadata('permissions', [permissionsArray, checkMode, presence]);
};
