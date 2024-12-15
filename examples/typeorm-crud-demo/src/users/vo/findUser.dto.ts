import { Expose } from 'class-transformer';
import {
  IsEmailLocalized,
  IsStringCombinedLocalized,
  PasswordLocalized,
} from '@aiofc/validation';
import { Column, Index } from 'typeorm';

export class UserProfileDto {
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
  // @Column({ nullable: true, length: 256 })
  // @Expose()
  // @PasswordLocalized()
  // password?: string;

  /**
   * 用户名
   * - 不允许为空
   * - 最大长度256字符
   */
  // @Column({ type: String, nullable: false, length: 256 })
  // @Expose()
  // @IsStringCombinedLocalized({ minLength: 1, maxLength: 256 })
  // firstName!: string;

  /**
   * 用户姓
   * - 不允许为空
   * - 最大长度256字符
   */
  // @Column({ type: String, nullable: false, length: 256 })
  // @Expose()
  // @IsStringCombinedLocalized({ minLength: 1, maxLength: 256 })
  // lastName!: string;
}
