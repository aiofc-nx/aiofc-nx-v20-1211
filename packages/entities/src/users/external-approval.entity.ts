import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  VersionColumn,
} from 'typeorm';
import { ApprovalType } from './types/approval-type.enum';

import { UserProfile } from './user-profile.entity';
import {
  IsNumberLocalized,
  IsStringCombinedLocalized,
  IsStringEnumLocalized,
  IsUUIDLocalized,
} from '@aiofc/validation';
import { Expose } from 'class-transformer';
import { TrackedTypeormBaseEntity } from '@aiofc/typeorm';

/**
 * 外部审批实体类
 * 用于用户邮箱、手机号或其他需要审批的外部验证
 *
 * 主要功能和字段说明:
 * - 可以根据需要使用或不使用code字段
 * - 邮箱审批只需要使用id即可
 * - 手机号审批可以使用code字段
 * - 其他情况可以根据需要同时使用id和code字段
 */
@Entity('external_approvals') // 定义数据库表名为external_approvals
export class ExternalApproval extends TrackedTypeormBaseEntity {
  /**
   * 主键ID
   * 使用UUID自动生成
   */
  @PrimaryGeneratedColumn('uuid')
  @Expose()
  @IsUUIDLocalized()
  id!: string;

  /**
   * 关联的用户ID
   * 不允许为空,并建立索引
   */
  @Column({ nullable: false })
  @Index()
  @Expose()
  @IsUUIDLocalized()
  userId!: string;

  /**
   * 验证码
   * 不允许为空,最大长度128字符
   */
  @Expose()
  @Column({ nullable: false, length: 128 })
  @IsStringCombinedLocalized({ minLength: 1, maxLength: 128 })
  code!: string;

  /**
   * 审批类型
   * 使用枚举类型,不允许为空
   */
  @Column({
    type: 'enum',
    enum: ApprovalType,
    nullable: false,
  })
  @IsStringEnumLocalized(ApprovalType)
  approvalType!: ApprovalType;

  /**
   * 关联的用户信息
   * 使用ManyToOne关系,开启eager loading
   */
  @ManyToOne(() => UserProfile, {
    eager: true,
  })
  @JoinColumn()
  user!: UserProfile;

  /**
   * 版本号
   * 用于乐观锁控制
   */
  @VersionColumn()
  @IsNumberLocalized()
  @Expose()
  version!: number;
}
