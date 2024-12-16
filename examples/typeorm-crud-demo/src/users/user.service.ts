import { UserProfile, UserProfileStatus } from '@aiofc/entities';
import { Injectable } from '@nestjs/common';
import { Transactional } from 'typeorm-transactional';
import { BaseEntityService } from '@aiofc/service-base';
import { UserRepository } from './user.repository';
import { TrackedTypeormBaseEntity } from '@aiofc/typeorm-base';
import { FindOptionsWhere } from 'typeorm';

@Injectable()
export class UserService extends BaseEntityService<
  UserProfile,
  'id',
  UserRepository
> {
  constructor(private readonly usersRepository: UserRepository) {
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
  async findOneByEmail(email: string) {
    const where: FindOptionsWhere<UserProfile> = {
      email: email.toLowerCase().trim(),
      // userTenantsAccounts: {
      //   tenantId,
      // },
    };
    return this.usersRepository.findOne(where);
  }

  //   @Transactional()
  //   async createUserByEmail(request: UserProfileDto) {
  //     /**
  //      * 通过邮箱创建新用户
  //      *
  //      * @param request - 包含用户注册信息的请求对象
  //      * @returns {Promise<{user: UserProfile}>} 返回创建的用户和外部审批记录
  //      */

  //     /**
  //      * 第一步: 处理用户数据
  //      * - 从请求中解构出repeatedPassword,不需要保存到数据库
  //      * - 使用剩余参数收集其他用户数据
  //      */
  //     // const { repeatedPassword, ...userData } = request;

  //     /**
  //      * 第二步: 创建用户记录
  //      * - 使用userData作为基础数据
  //      * - 设置用户状态为等待邮箱验证
  //      * - 使用类型断言确保类型安全:
  //      *   - Omit<UserProfile, 'id'>: 创建时不需要id字段
  //      *   - Partial<Pick<UserProfile, 'id'>>: id字段为可选
  //      */
  //     const user = await this.usersRepository.create({
  //       ...request,
  //       status: UserProfileStatus.WAITING_FOR_EMAIL_APPROVAL,
  //     } as Omit<UserProfile, 'id'> & Partial<Pick<UserProfile, 'id'>>);

  //     /**
  //      * 返回创建的用户和外部审批记录
  //      */
  //     return user;
  //   }
}
