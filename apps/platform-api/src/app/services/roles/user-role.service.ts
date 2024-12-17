import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Transactional } from 'typeorm-transactional';
import { FindOptionsWhere, IsNull } from 'typeorm';
import { PaginateConfig, Paginated, PaginateQuery } from 'nestjs-paginate';
import { ClassConstructor } from 'class-transformer';
import { BaseEntityService } from '@aiofc/service-base';
import { RoleType, UserRole } from '@aiofc/entities';
import { UserRoleRepository } from '../../repositories/roles/user-role.repository';
import { ClsService } from '@aiofc/nestjs-cls';
import { ClsStore } from '../../../common/vo/cls-store';
import { map } from '@aiofc/validation';

@Injectable()
export class UserRoleService extends BaseEntityService<
  UserRole,
  'id',
  UserRoleRepository
> {
  constructor(
    repository: UserRoleRepository,
    private readonly clsService: ClsService<ClsStore>
  ) {
    super(repository);
  }

  /**
   * 分页查询租户的所有角色
   *
   * 该方法实现了租户角色的分页查询功能:
   * 1. 参数说明:
   *    - query: 分页查询参数,包含页码、每页数量等
   *    - config: 分页配置,包含排序、搜索等选项
   *    - clazz: 目标类型的构造函数,用于类型转换
   *
   * 2. 实现细节:
   *    - 构造查询条件:
   *      - 查询当前租户的角色(tenantId = 当前租户ID)
   *      - 查询系统默认角色(tenantId = null)
   *    - 执行分页查询获取结果
   *    - 将结果数据转换为目标类型
   *
   * 3. 返回值:
   *    - 返回分页结果对象
   *    - 包含转换后的类型数据
   *
   * @param query - 分页查询参数
   * @param config - 分页配置
   * @param clazz - 目标类型构造函数
   * @returns 返回分页的角色数据
   */
  async findAllRolesPaginatedForTenant<T>(
    query: PaginateQuery,
    config: PaginateConfig<UserRole>,
    clazz: ClassConstructor<T> // `clazz` 是编程社区中的一个常见约定，当需要表示一个类的构造函数或类型时，经常使用这种拼写方式来避免与关键字冲突。这种写法最早可能来源于 Java 社区。
  ): Promise<Paginated<T>> {
    const result = await this.repository.findAllPaginated(query, {
      ...config,
      where: [
        {
          tenantId: this.clsService.get().tenantId,
        },
        {
          tenantId: IsNull(),
        },
      ],
    });

    const data = result.data.map((item) => map(item, clazz));
    return { ...result, data } as Paginated<T>;
  }

  /**
   * 查询租户的指定角色
   *
   * 该方法用于查找特定ID的角色，包括:
   * 1. 当前租户的角色
   * 2. 系统默认角色(tenantId为null)
   *
   * 实现细节:
   * - 构造查询条件数组，包含两种情况:
   *   a. 匹配指定ID且tenantId等于当前租户ID
   *   b. 匹配指定ID且tenantId为null(系统默认角色)
   * - 使用repository执行查询
   *
   * @param id - 要查询的角色ID
   * @returns 返回找到的角色实体，如果未找到则返回null
   */
  public async findOneForTenant(id: string) {
    const where: FindOptionsWhere<UserRole>[] = [
      {
        id,
        tenantId: this.clsService.get().tenantId,
      },
      {
        id,
        tenantId: IsNull(),
      },
    ];
    return this.repository.findOne(where);
  }

  /**
   * 查找默认的普通用户角色
   *
   * 该方法用于获取系统预设的普通用户角色。
   *
   * 实现细节:
   * - 使用@Transactional()装饰器确保事务完整性
   * - 调用findDefaultRoleByType方法查找REGULAR_USER类型的角色
   * - 返回查找到的角色实体
   *
   * 使用场景:
   * - 新用户注册时分配默认角色
   * - 重置用户角色为默认值
   *
   * @returns 返回默认的普通用户角色实体
   */
  @Transactional()
  async findDefaultUserRole() {
    return this.findDefaultRoleByType(RoleType.REGULAR_USER);
  }

  /**
   * 查找默认的管理员角色
   *
   * 该方法用于获取系统预设的管理员角色。
   *
   * 实现细节:
   * - 使用@Transactional()装饰器确保事务完整性
   * - 调用findDefaultRoleByType方法查找ADMIN类型的角色
   * - 返回查找到的角色实体
   *
   * 使用场景:
   * - 创建新租户时设置管理员
   * - 提升用户为管理员时使用
   *
   * @returns 返回默认的管理员角色实体
   */
  @Transactional()
  async findDefaultAdminRole() {
    return this.findDefaultRoleByType(RoleType.ADMIN);
  }

  /**
   * 根据角色类型查找默认角色
   *
   * 该方法用于查找系统默认角色(不属于任何租户的角色)。
   *
   * 实现细节:
   * - 通过roleType参数指定要查找的角色类型
   * - tenantId设为null表示查找系统级别的默认角色
   * - 使用repository的findOne方法执行查询
   *
   * 使用场景:
   * - 查找默认的普通用户角色
   * - 查找默认的管理员角色
   *
   * @param roleType - 要查找的角色类型(如REGULAR_USER、ADMIN等)
   * @returns 返回找到的默认角色实体，如果未找到则返回null
   */
  private findDefaultRoleByType(roleType: RoleType) {
    return this.repository.findOne({
      roleType,
      tenantId: IsNull(),
    });
  }

  /**
   * 归档租户的指定角色
   *
   * 该方法用于归档特定ID和版本号的角色，包括以下步骤:
   * 1. 验证角色是否存在且属于当前租户
   * 2. 检查版本号是否匹配以避免并发冲突
   * 3. 执行归档操作
   *
   * 实现细节:
   * - 首先调用findOneForTenant确认角色存在且属于当前租户
   * - 通过version字段进行乐观锁控制
   * - 使用repository的archive方法执行实际的归档
   *
   * 异常处理:
   * - 找不到角色时抛出NotFoundException
   * - 版本号不匹配时抛出ConflictException
   *
   * @param id - 要归档的角色ID
   * @param version - 角色的当前版本号
   * @returns 返回是否归档成功的布尔值
   * @throws NotFoundException 当角色不存在时
   * @throws ConflictException 当版本号不匹配时
   */
  public async archiveOneForTenant(
    id: string,
    version: number
  ): Promise<boolean> {
    const userRole = await this.findOneForTenant(id);
    if (!userRole) {
      throw new NotFoundException('UserRole not found');
    } else if (userRole.version !== version) {
      throw new ConflictException('Version conflict');
    }
    return this.repository.archive(id);
  }
}
