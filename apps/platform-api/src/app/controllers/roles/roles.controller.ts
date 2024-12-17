import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRoleService } from '../../services';
import {
  CreateUserRole,
  ROLES_PAGINATION_CONFIG,
  UpdateUserRole,
  UserRoleWithoutPermission,
} from './vo/role.dto';
import { IdParamUUID, VersionNumberParam } from '@aiofc/common-types';
import { Permissions, Roles } from '@aiofc/auth';
import {
  Paginate,
  Paginated,
  PaginatedSwaggerDocs,
  PaginateQuery,
} from 'nestjs-paginate';
import { map } from '@aiofc/validation';
import { RoleType, UserRole } from '@aiofc/entities';

@ApiTags('Roles')
@Controller({
  path: 'roles',
  version: '1',
})
@ApiBearerAuth()
export class RolesController {
  constructor(private readonly userRoleService: UserRoleService) {}

  /**
   * 获取所有角色列表（分页）
   *
   * @description
   * - 使用GET请求方法
   * - 仅允许ADMIN和SUPER_ADMIN角色访问
   * - 需要'platform.roles.read'权限
   * - 返回分页后的角色列表数据
   *
   * @param query - 分页查询参数
   * @returns {Promise<Paginated<UserRoleWithoutPermission>>} 分页后的角色列表数据
   */
  @Get()
  @Roles<RoleType>([RoleType.ADMIN, RoleType.SUPER_ADMIN])
  @Permissions('platform.roles.read')
  @PaginatedSwaggerDocs(UserRoleWithoutPermission, ROLES_PAGINATION_CONFIG)
  async findAll(
    @Paginate()
    query: PaginateQuery
  ): Promise<Paginated<UserRoleWithoutPermission>> {
    return this.userRoleService.findAllRolesPaginatedForTenant(
      query,
      ROLES_PAGINATION_CONFIG,
      UserRoleWithoutPermission
    );
  }

  /**
   * 获取指定ID的角色信息
   *
   * @description
   * - 使用GET请求方法
   * - 需要'platform.roles.read'权限
   * - 根据路径参数中的ID查询单个角色
   * - 返回不含权限信息的角色数据
   *
   * 实现步骤:
   * 1. 接收路径参数中的ID
   * 2. 调用service层查询指定租户下的角色
   * 3. 将结果映射为UserRoleWithoutPermission类型并返回
   *
   * @param findOneOptions - 包含角色ID的参数对象
   * @returns {Promise<UserRoleWithoutPermission>} 角色信息(不含权限)
   */
  @Get(':id')
  @Permissions('platform.roles.read')
  async findOne(
    @Param() findOneOptions: IdParamUUID
  ): Promise<UserRoleWithoutPermission> {
    return this.userRoleService
      .findOneForTenant(findOneOptions.id)
      .then((data) => {
        return map(data, UserRoleWithoutPermission);
      });
  }

  /**
   * 创建新角色
   *
   * @description
   * - 使用POST请求方法
   * - 需要'platform.roles.create'权限
   * - 将请求体中的数据转换为UserRole实体
   * - 创建新角色并返回不含权限信息的角色数据
   *
   * 实现步骤:
   * 1. 接收CreateUserRole类型的请求体数据
   * 2. 使用Object.assign创建新的UserRole实体
   * 3. 调用service层创建角色
   * 4. 将结果映射为UserRoleWithoutPermission类型并返回
   *
   * @param customUserRole - 创建角色的请求数据
   * @returns {Promise<UserRoleWithoutPermission>} 创建成功的角色信息(不含权限)
   */
  @Post()
  @Permissions('platform.roles.create')
  async create(@Body() customUserRole: CreateUserRole) {
    const userRole = Object.assign(new UserRole(), customUserRole);
    return this.userRoleService.create(userRole).then((item) => {
      return map(item, UserRoleWithoutPermission);
    });
  }

  /**
   * 更新角色信息
   *
   * @description
   * - 使用PUT请求方法
   * - 需要'platform.roles.update'权限
   * - 更新指定ID的角色信息
   * - 返回不含权限信息的角色数据
   *
   * 实现步骤:
   * 1. 接收路径参数中的ID和UpdateUserRole类型的请求体数据
   * 2. 使用Object.assign合并ID和更新数据创建新的UserRole实体
   * 3. 调用service层更新角色
   * 4. 查询更新后的角色数据
   * 5. 将结果映射为UserRoleWithoutPermission类型并返回
   *
   * @param id - 包含角色ID的参数对象
   * @param role - 更新角色的请求数据
   * @returns {Promise<UserRoleWithoutPermission>} 更新后的角色信息(不含权限)
   */
  @Put(':id')
  @Permissions('platform.roles.update')
  async updateOne(
    @Param() id: IdParamUUID,
    @Body() role: UpdateUserRole
  ): Promise<UserRoleWithoutPermission> {
    return this.userRoleService
      .update(
        Object.assign(new UserRole(), {
          ...id,
          ...role,
        })
      )
      .then((item) => {
        return this.userRoleService.findById(item.id);
      })
      .then((item) => {
        return map(item, UserRoleWithoutPermission);
      });
  }

  /**
   * 软删除角色
   *
   * @description
   * - 使用DELETE请求方法
   * - 返回204 No Content状态码
   * - 需要'platform.roles.delete'权限
   * - 执行软删除操作,将角色标记为已归档而不是物理删除
   *
   * 实现步骤:
   * 1. 接收路径参数中的角色ID
   * 2. 接收查询参数中的版本号,用于乐观锁控制
   * 3. 调用service层的archiveOneForTenant方法执行软删除
   * 4. 操作成功后返回204状态码
   *
   * @param path - 包含角色ID的参数对象
   * @param query - 包含版本号的查询参数对象
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Permissions('platform.roles.delete')
  async softDelete(
    @Param() path: IdParamUUID,
    @Query() query: VersionNumberParam
  ) {
    await this.userRoleService.archiveOneForTenant(path.id, query.version);
  }
}
