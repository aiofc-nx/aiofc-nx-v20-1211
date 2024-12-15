import { Injectable, Logger } from '@nestjs/common';
import { Transactional } from 'typeorm-transactional';

import AbstractAuthUserService from '../auth/abstract-auth-user.service';
import { Maybe, Never } from '@aiofc/common-types';

import { BaseSignUpByEmailRequest } from '../../controllers/auth/vo/sign-up.dto';
import { AbstractTokenBuilderService, JwtTokensPayload } from '@aiofc/auth';
import {
  ApprovalType,
  ExternalApproval,
  UserAccountStatus,
  UserProfile,
  UserProfileStatus,
  UserRole,
} from '@aiofc/entities';
import {
  AccessTokenPayload,
  RefreshTokenPayload,
} from '../../../common/vo/token-payload';
import { generateRandomNumber } from '@aiofc/utils';
import { UserService } from './user.service';
import { ExternalApprovalService } from './external-approval.service';

@Injectable()
export default class AuthUserService extends AbstractAuthUserService {
  private readonly logger = new Logger(AuthUserService.name);

  constructor(
    private readonly userService: UserService,
    // private readonly userTenantAccount: UserTenantAccountService,
    private readonly externalApprovalService: ExternalApprovalService,
    private readonly tokenBuilderService: AbstractTokenBuilderService<
      UserProfile,
      AccessTokenPayload,
      RefreshTokenPayload
    >
  ) {
    super();
  }

  /**
   * 通过邮箱查找用户,本方法需要调用 UserService 作为提供者去访问数据库
   *
   * @param email - 用户邮箱地址
   * @returns {Promise<Maybe<UserProfile>>} 如果找到用户则返回用户信息，否则返回undefined
   *
   * 该方法使用@Transactional()装饰器确保数据库操作的事务性
   * 重写了抽象类中的findUserByEmail方法
   *
   * 执行流程:
   * 1. 调用userService.findOneByEmail查询数据库
   * 2. 如果未找到用户则返回undefined
   * 3. 如果找到用户则返回用户信息
   */
  @Transactional()
  override async findUserByEmail(email: string): Promise<Maybe<UserProfile>> {
    const user = await this.userService.findOneByEmail(email);
    if (!user) {
      return undefined;
    }
    return user;
  }

  override async createUserByEmail(request: BaseSignUpByEmailRequest) {
    /**
     * 通过邮箱创建新用户
     *
     * @param request - 包含用户注册信息的请求对象
     * @returns {Promise<{user: UserProfile, externalApproval: ExternalApproval}>} 返回创建的用户和外部审批记录
     */

    /**
     * 第一步: 处理用户数据
     * - 从请求中解构出repeatedPassword,不需要保存到数据库
     * - 使用剩余参数收集其他用户数据
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { repeatedPassword, ...userData } = request;

    /**
     * 第二步: 创建用户记录
     * - 使用userData作为基础数据
     * - 设置用户状态为等待邮箱验证
     * - 使用类型断言确保类型安全:
     *   - Omit<UserProfile, 'id'>: 创建时不需要id字段
     *   - Partial<Pick<UserProfile, 'id'>>: id字段为可选
     */
    const user = await this.userService.create({
      ...userData,
      status: UserProfileStatus.WAITING_FOR_EMAIL_APPROVAL,
    } as Omit<UserProfile, 'id'> & Partial<Pick<UserProfile, 'id'>>);

    /**
     * 第三步: 创建外部审批记录
     * - 关联新创建的用户
     * - 生成6位随机验证码
     * - 设置审批类型为注册审批
     * - 使用类型断言处理id字段
     */
    const externalApproval = await this.externalApprovalService.create({
      userId: user.id,
      user,
      code: generateRandomNumber(6).toString(),
      approvalType: ApprovalType.REGISTRATION,
    } as Omit<ExternalApproval, 'id'> & Partial<Pick<ExternalApproval, 'id'>>);

    /**
     * 返回创建的用户和外部审批记录
     */
    return {
      user,
      externalApproval,
    };
  }

  // @Transactional()
  // override async createSsoUser(
  //   tenantId: string,
  //   email: string,
  //   firstName: string,
  //   lastName: string,
  //   roles: UserRole[],
  //   userProfileId?: string
  // ): Promise<JwtTokensPayload> {
  //   const userProfile = await (userProfileId
  //     ? this.userService.createOrUpdateEntity({
  //         status: UserProfileStatus.ACTIVE,
  //         email,
  //         firstName,
  //         lastName,
  //       })
  //     : this.userService.findOneById(userProfileId));

  //   await this.userTenantAccount.createOrUpdateEntity({
  //     tenantId,
  //     userProfileId: userProfile.id,
  //     userProfile,
  //     userStatus: UserAccountStatus.ACTIVE,
  //     roles,
  //   });

  //   return this.tokenBuilderService.buildTokensPayload(userProfile);
  // }

  // @Transactional()
  // override async findUserByEmail(email: string): Promise<Maybe<UserProfile>> {
  //   const user = await this.userService.findOneByEmail(email);

  //   if (!user) {
  //     return undefined;
  //   }

  //   return user;
  // }

  // /* istanbul ignore next */
  // override async saveRefreshToken(
  //   // eslint-disable-next-line @typescript-eslint/no-unused-vars
  //   _userId: string,
  //   // eslint-disable-next-line @typescript-eslint/no-unused-vars
  //   _token: string
  // ): Promise<void> {
  //   this.logger.error(`saveRefreshToken not implemented yet`);
  // }

  // @Transactional()
  // override async approveSignUp(
  //   approveId: string,
  //   code: string
  // ): Promise<boolean> {
  //   // todo consider allowing limited amount of times to try to approve account (e.g. 3 times)
  //   //  than archive and send new email with new code to approve account
  //   const approvalEntity = await this.externalApprovalService.findOneById(
  //     approveId,
  //     false
  //   );

  //   if (!approvalEntity) {
  //     this.logger.log(
  //       `approvalEntity not found for id ${approveId}, code ${code}`,
  //       { securityConcern: true }
  //     );
  //     return false;
  //   }

  //   if (approvalEntity.code === code) {
  //     await this.userService.updateUserStatus(
  //       approvalEntity.userId,
  //       UserProfileStatus.ACTIVE
  //     );

  //     return this.externalApprovalService.archive(
  //       approveId,
  //       approvalEntity.version
  //     );
  //   } else {
  //     this.logger.log(`code ${code} is not valid, probably user typo`);
  //     return false;
  //   }
  // }

  // TODO: 实现这些方法
  public createSsoUser(
    tenantId: string,
    email: string,
    firstName: string,
    lastName: string,
    roles: UserRole[],
    userProfileId?: string
  ): Promise<JwtTokensPayload> {
    throw new Error('Method not implemented.');
  }
  public saveRefreshToken(userId: string, token: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
  public approveSignUp(approveId: string, code: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
}
