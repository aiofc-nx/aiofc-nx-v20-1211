import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  VersionColumn,
} from 'typeorm';

import { UserProfileStatus } from './types/user-profile-status.enum';
import { UserTenantAccount } from './user-tenant-account.entity';
import {
  IsEmailLocalized,
  IsNumberLocalized,
  IsStringCombinedLocalized,
  IsStringEnumLocalized,
  IsUUIDLocalized,
  PasswordLocalized,
} from '@aiofc/validation';
import { Expose } from 'class-transformer';
import { TrackedTypeormBaseEntity } from '@aiofc/typeorm';

/**
 * 用户档案实体类
 * 用于存储用户的基本信息,如邮箱、密码、姓名等
 *
 * 主要功能:
 * - 存储用户基本信息
 * - 管理用户状态
 * - 关联租户账号
 * - 支持版本控制
 */
@Entity('user_profile')
export class UserProfile extends TrackedTypeormBaseEntity {
  /**
   * 用户ID
   * 使用UUID自动生成的主键
   */
  @PrimaryGeneratedColumn('uuid')
  @Expose()
  @IsUUIDLocalized()
  id!: string;

  /**
   * 用户邮箱
   * - 唯一索引
   * - 不允许为空
   * - 最大长度320字符
   */
  @Column({ type: String, unique: true, nullable: false, length: 320 })
  @Index({ unique: true })
  @Expose()
  @IsEmailLocalized()
  email!: string;

  /**
   * 用户密码
   * - 可为空,支持后续设置密码
   * - 支持社交网络/SSO登录场景
   * - 最大长度256字符
   */
  @Column({ nullable: true, length: 256 })
  @Expose()
  @PasswordLocalized()
  password?: string;

  /**
   * 用户名
   * - 不允许为空
   * - 最大长度256字符
   */
  @Column({ type: String, nullable: false, length: 256 })
  @Expose()
  @IsStringCombinedLocalized({ minLength: 1, maxLength: 256 })
  firstName!: string;

  /**
   * 用户姓
   * - 不允许为空
   * - 最大长度256字符
   */
  @Column({ type: String, nullable: false, length: 256 })
  @Expose()
  @IsStringCombinedLocalized({ minLength: 1, maxLength: 256 })
  lastName!: string;

  /**
   * 用户状态
   * 使用UserProfileStatus枚举类型
   */
  @Column({
    type: 'enum',
    enum: UserProfileStatus,
  })
  @Expose()
  @IsStringEnumLocalized(UserProfileStatus)
  status!: UserProfileStatus;

  /**
   * 用户关联的租户账号列表
   * - 一对多关系
   * - 非立即加载
   */
  @OneToMany(() => UserTenantAccount, (tenantUser) => tenantUser.userProfile, {
    eager: false,
  })
  userTenantsAccounts?: UserTenantAccount[];

  /**
   * 版本号
   * 用于实现乐观锁控制
   */
  @VersionColumn()
  @IsNumberLocalized()
  @Expose()
  version!: number;
}
