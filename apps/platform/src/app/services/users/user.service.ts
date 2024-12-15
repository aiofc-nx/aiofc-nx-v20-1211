import { UserProfile, UserProfileStatus } from '@aiofc/entities';
import { Injectable } from '@nestjs/common';
import { Transactional } from 'typeorm-transactional';
import { BaseEntityService } from '@aiofc/service-base';
import { UserRepository } from '../../repositories/users/user.repository';
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

  /**
   * 根据邮箱地址查找数据库中的用户档案表
   *
   * @param email - 用户邮箱地址
   * @param tenantId - 可选的租户ID
   * @returns 返回查找到的用户信息，如果未找到则返回null
   *
   * 该方法会:
   * 1. 将邮箱地址转换为小写并去除首尾空格
   * 2. 构建查询条件，包含邮箱和租户信息
   * 3. 使用事务执行查询操作
   */
  @Transactional()
  async findOneByEmail(email: string, tenantId?: string) {
    const where: FindOptionsWhere<UserProfile> = {
      email: email.toLowerCase().trim(),
      userTenantsAccounts: {
        tenantId,
      },
    };
    return this.usersRepository.findOne(where);
  }

  // async findByIdWithRelations(relations: string[], id: string) {
  //   const user = await this.usersRepository.findByIdWithRelations(id);
  //   return user;
  // }

  // @Transactional()
  // async updateUserStatus(id: string, status: UserProfileStatus) {
  //   const userProfile = await this.usersRepository.findOne(id);
  //   userProfile.status = status;
  //   const updateResult = await this.usersRepository.update(userProfile);

  //   return updateResult.affected === 1;
  // }
}
