import { UserRole } from '@aiofc/entities';
import {
  DEFAULT_CREATE_ENTITY_EXCLUDE_LIST,
  DEFAULT_ENTITY_EXCLUDE_LIST,
  DEFAULT_UPDATE_ENTITY_EXCLUDE_LIST,
} from '@aiofc/typeorm-base';
import { OmitType } from '@nestjs/swagger';
import { FilterOperator, PaginateConfig } from 'nestjs-paginate';

/**
 * 用户角色DTO类 - 不包含权限信息
 * 继承自UserRole，但排除了以下字段:
 * - 默认实体排除字段
 * - permissions (权限)
 * - tenant (租户)
 */
export class UserRoleWithoutPermission extends OmitType(UserRole, [
  ...DEFAULT_ENTITY_EXCLUDE_LIST,
  'permissions',
  'tenant',
] as const) {}

/**
 * 创建用户角色DTO类
 * 继承自UserRole，但排除了以下字段:
 * - 默认创建实体时排除的字段
 * - roleType (角色类型)
 * - tenant (租户)
 * - permissions (权限)
 * - tenantId (租户ID)
 * - id (主键)
 * - version (版本)
 */
export class CreateUserRole extends OmitType(UserRole, [
  ...DEFAULT_CREATE_ENTITY_EXCLUDE_LIST,
  'roleType',
  'tenant',
  'permissions',
  'tenantId',
  'id',
  'version',
] as const) {}

/**
 * 更新用户角色DTO类
 * 继承自UserRole，但排除了以下字段:
 * - 默认更新实体时排除的字段
 * - roleType (角色类型)
 * - permissions (权限)
 * - tenantId (租户ID)
 */
export class UpdateUserRole extends OmitType(UserRole, [
  ...DEFAULT_UPDATE_ENTITY_EXCLUDE_LIST,
  'roleType',
  'permissions',
  'tenantId',
] as const) {}

/**
 * 角色分页配置
 * 定义了角色列表查询的分页、搜索、过滤和排序规则
 */
export const ROLES_PAGINATION_CONFIG: PaginateConfig<UserRole> = {
  // 默认每页显示50条
  defaultLimit: 50,
  // 每页最多显示100条
  maxLimit: 100,
  // 可搜索的字段：名称和角色类型
  searchableColumns: ['name', 'roleType'],
  // 可过滤的字段配置
  filterableColumns: {
    // id支持相等和包含在列表中的过滤
    id: [FilterOperator.EQ, FilterOperator.IN],
    // name支持模糊查询
    name: [FilterOperator.CONTAINS],
  },
  // 可排序的字段
  sortableColumns: ['id', 'name', 'createdAt', 'updatedAt'],
  // 默认排序规则：先按创建时间降序，再按ID降序
  defaultSortBy: [
    ['createdAt', 'DESC'],
    ['id', 'DESC'],
  ],
};
