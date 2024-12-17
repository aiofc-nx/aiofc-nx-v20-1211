import {
  ApprovalType,
  ExternalApproval,
  UserProfile,
  UserProfileStatus,
} from '@aiofc/entities';
import { Injectable } from '@nestjs/common';
import { Transactional } from 'typeorm-transactional';
import { BaseEntityService } from '@aiofc/service-base';
import { UserRepository } from './user.repository';
import { TrackedTypeormBaseEntity } from '@aiofc/typeorm-base';
import { FindOptionsWhere } from 'typeorm';
import { BaseSignUpByEmailRequest } from './vo/sign-up.dto';
import { ExternalApprovalService } from './external-approval.service';
import { generateRandomNumber } from '@aiofc/utils';

@Injectable()
export class UserService extends BaseEntityService<
  UserProfile,
  'id',
  UserRepository
> {
  constructor(
    private readonly usersRepository: UserRepository,
    private readonly externalApprovalService: ExternalApprovalService
  ) {
    super(usersRepository);
  }

  @Transactional()
  async createUser() {
    return this.usersRepository.create({
      email: 'test@test.com',
      lastName: 'test',
      firstName: 'test',
      status: UserProfileStatus.ACTIVE,
    } as Omit<UserProfile, 'id' | keyof TrackedTypeormBaseEntity> & Partial<Pick<UserProfile, 'id'>>);
  }

  /**
   * 根据邮箱查询用户信息
   *
   * 该方法用于查询指定邮箱对应的用户记录
   *
   * 实现细节:
   * 1. 参数说明:
   *    - email: 用户邮箱地址
   *    - tenantId: 可选的租户ID
   *
   * 2. 查询条件构造:
   *    - 邮箱地址转小写并去除首尾空格
   *    - 如果提供tenantId,添加租户关联查询条件
   *
   * 3. 执行查询:
   *    - 使用repository的findOne方法查询单条记录
   *
   * 4. 事务处理:
   *    - 使用@Transactional装饰器确保事务完整性
   *
   * @param email - 用户邮箱
   * @param tenantId - 可选的租户ID
   * @returns 返回查询到的用户信息或undefined
   */
  @Transactional()
  async findOneByEmail(email: string, tenantId?: string) {
    const where: FindOptionsWhere<UserProfile> = {
      email: email.toLowerCase().trim(),
      userTenantsAccounts: {
        tenantId,
      },
    };
    const user = await this.usersRepository.findOne(where);
    if (!user) {
      return undefined;
    }
    return user;
  }

  @Transactional()
  async createUserByEmail(request: BaseSignUpByEmailRequest) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { repeatedPassword, ...userData } = request;
    const user = await this.usersRepository.create({
      ...userData,
      status: UserProfileStatus.WAITING_FOR_EMAIL_APPROVAL,
    } as Omit<UserProfile, 'id'> & Partial<Pick<UserProfile, 'id'>>);

    const externalApproval = await this.externalApprovalService.create({
      userId: user.id,
      user,
      code: generateRandomNumber(6).toString(),
      approvalType: ApprovalType.REGISTRATION,
    } as Omit<ExternalApproval, 'id'> & Partial<Pick<ExternalApproval, 'id'>>);

    /**
     * 返回创建的用户和外部审批记录
     */
    return { user, externalApproval };
  }
}
