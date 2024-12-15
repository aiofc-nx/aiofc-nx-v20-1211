import { Injectable, Logger } from '@nestjs/common';
import { AbstractSignupService } from './abstract-signup.service';
import { SignUpByEmailWithTenantCreationRequest } from '../../../controllers/auth/vo/sign-up.dto';
import { ConflictEntityCreationException } from '@aiofc/exceptions';
import { hashPassword } from '@aiofc/utils';
import {
  UserAccountStatus,
  UserProfile,
  UserTenantAccount,
} from '@aiofc/entities';
import { Transactional } from 'typeorm-transactional';
import AbstractAuthUserService from '../abstract-auth-user.service';
import { UserService } from '../../users/user.service';
import {
  AccessTokenPayload,
  RefreshTokenPayload,
} from '../../../../common/vo/token-payload';
import { TenantService } from '../../tenants/tenant.service';
import { UserRoleService } from '../../roles/user-role.service';
import { UserTenantAccountService } from '../../users/user-tenant-account.service';
import { identity } from 'packages/config/src/core/utils/identity.util';

@Injectable()
export class TenantSignupService extends AbstractSignupService<SignUpByEmailWithTenantCreationRequest> {
  private readonly logger = new Logger(TenantSignupService.name);

  constructor(
    private readonly tenantService: TenantService,
    private readonly authUserService: AbstractAuthUserService,
    private readonly userService: UserService,
    private readonly userTenantAccountService: UserTenantAccountService,
    private readonly roleService: UserRoleService // private readonly tokenBuilderService: AbstractTokenBuilderService< //   UserProfile, //   AccessTokenPayload, //   RefreshTokenPayload // >
  ) {
    super();
  }
  /**
   * 实现用户注册的方法
   *
   * 业务逻辑：
   * 1. 检查用户是否已存在
   * 2. 创建用户
   * 3. 创建租户
   * 4. 创建用户租户关联
   * 5. 创建用户角色关联
   * 6. 创建用户令牌
   */
  @Transactional()
  async signUp(createUserDto: SignUpByEmailWithTenantCreationRequest) {
    /**
     * 检查用户是否已存在
     *
     * 通过调用 userAuthService.findUserByEmail() 方法,
     * 使用注册请求中的 email 查询是否已有相同邮箱的用户存在
     *
     * @param createUserDto.email - 用户注册时提供的邮箱地址
     * @returns 如果用户存在返回用户信息,不存在返回 null
     */
    const existingUser = await this.authUserService.findUserByEmail(
      createUserDto.email
    );

    /**
     * 检查用户是否已存在,如果存在则抛出异常
     *
     * 实现细节:
     * 1. 判断逻辑:
     *    - 如果 existingUser 存在,表示该邮箱已被注册
     *
     * 2. 错误处理:
     *    - 记录警告日志,包含:
     *      - 重复注册的邮箱地址
     *      - 已存在用户的ID
     *      - ignore 标记为 true
     *    - 抛出 ConflictEntityCreationException 异常
     *      表示实体创建冲突(邮箱重复)
     *
     * 3. 异常信息:
     *    - entity: 'User' - 冲突实体类型
     *    - field: 'email' - 冲突字段
     *    - value: 用户输入的邮箱地址
     */
    if (existingUser) {
      this.logger.warn(
        `提示：User trying to register with same email again: ${createUserDto.email}`,
        {
          userId: existingUser.id,
          ignore: true,
        }
      );
      throw new ConflictEntityCreationException(
        'User',
        'email',
        createUserDto.email
      );
    }
    // 对密码进行哈希处理
    const hashedPassword = await hashPassword(createUserDto.password);

    /**
     * 创建新用户
     *
     * 通过调用 userAuthService.createUserByEmail() 方法创建新用户,
     * 并获取用户信息和外部审批信息
     *
     * 实现细节:
     * 1. 参数构造:
     *    - 使用展开运算符(...) 复制 createUserDto 的所有字段
     *    - 覆盖 password 字段为哈希后的密码
     *
     * 2. 返回值解构:
     *    - user: 重命名为 userProfile - 新创建的用户信息
     *    - externalApproval - 外部审批相关信息
     */
    const { user: userProfile, externalApproval } =
      await this.authUserService.createUserByEmail({
        ...createUserDto,
        password: hashedPassword,
      });

    /**
     * 创建并设置租户
     *
     * 通过调用 tenantService.setupTenant() 方法创建新租户,
     * 并与当前用户关联
     *
     * 实现细节:
     * 1. 参数说明:
     *    - companyName: 公司名称
     *    - companyIdentifier: 公司标识符
     *    - userProfile: 新创建的用户信息
     *
     * 2. 返回值:
     *    - tenant: 新创建的租户信息
     */
    const tenant = await this.tenantService.setupTenant(
      createUserDto.companyName,
      createUserDto.companyIdentifier,
      userProfile
    );

    // 获取默认的管理员角色
    // 通过调用 roleService.findDefaultAdminRole() 方法获取系统预设的管理员角色
    // 该角色将被分配给新注册的租户管理员用户
    const adminRole = await this.roleService.findDefaultAdminRole();

    this.logger.log(
      `Creating a new user, with email address: ${createUserDto.email}`
    );

    /**
     * 创建或更新用户租户账号
     *
     * 通过调用 userTenantAccountService.createOrUpdateEntity() 方法创建用户租户账号,
     * 将用户与租户关联并设置相应权限
     *
     * 参数说明:
     * - tenantId: 租户ID,关联到新创建的租户
     * - userProfileId: 用户ID,关联到新创建的用户
     * - userProfile: 用户信息对象
     * - roles: 用户角色数组,包含默认管理员角色
     * - userStatus: 用户状态,设为激活状态
     */
    await this.userTenantAccountService.create({
      tenantId: tenant.id,
      userProfileId: userProfile.id,
      userProfile,
      roles: [adminRole],
      userStatus: UserAccountStatus.ACTIVE,
    } as Omit<UserTenantAccount, 'id'> & Partial<Pick<UserTenantAccount, 'id'>>);
    // 获取完整的用户信息，需要显式加载租户账户和角色关系
    const userUpdated = await this.userService.findByIdWithRelations(
      ['userTenantsAccounts', 'userTenantsAccounts.roles'],
      userProfile.id
    );

    return {
      jwtPayload: this.tokenBuilderService.buildTokensPayload(userUpdated),
      approvalId: externalApproval.id,
    };
  }
}
