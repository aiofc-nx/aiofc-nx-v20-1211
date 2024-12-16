import { JwtTokensPayload } from '@aiofc/auth';
import { UserProfile } from '@aiofc/entities';
import { DEFAULT_CREATE_ENTITY_EXCLUDE_LIST } from '@aiofc/typeorm-base';
import {
  IsStringCombinedLocalized,
  MatchesWithProperty,
  PasswordLocalized,
} from '@aiofc/validation';
import { OmitType } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

/**
 * 请求通过邮箱来注册的基础类，这个类以UserProfile类为基础（继承）
 *
 * 首先排除UserProfile的以下字段:
 * - DEFAULT_CREATE_ENTITY_EXCLUDE_LIST中的默认排除字段
 * - id: 用户ID
 * - version: 版本号
 * - status: 状态
 * - userTenantsAccounts: 用户租户账号关联
 *
 * 然后添加以下字段:
 * - repeatedPassword: 重复密码字段
 *
 * 最后的属性包括：
 */
export class BaseSignUpByEmailRequest extends OmitType(UserProfile, [
  ...DEFAULT_CREATE_ENTITY_EXCLUDE_LIST,
  'id',
  'version',
  'status',
  'userTenantsAccounts',
] as const) {
  /**
   * 重复密码字段
   * 用于验证两次输入的密码是否一致
   * 在前后端都进行验证是个好习惯
   * 这样即使前端出现问题,也能避免将错误数据保存到数据库
   *
   * @PasswordLocalized - 使用本地化的密码验证装饰器
   * @MatchesWithProperty - 验证是否与password字段匹配
   * @IsStringCombinedLocalized - 使用本地化的字符串组合验证
   */
  @PasswordLocalized()
  @MatchesWithProperty(BaseSignUpByEmailRequest, (s) => s.password, {
    message: 'validation.REPEAT_PASSWORD_DOESNT_MATCH',
  })
  @IsStringCombinedLocalized()
  repeatedPassword!: string;
}

export class SignUpByEmailWithTenantCreationRequest extends BaseSignUpByEmailRequest {
  @IsStringCombinedLocalized({
    minLength: 1,
    maxLength: 127,
  })
  companyName!: string;

  @IsStringCombinedLocalized({
    minLength: 1,
    maxLength: 127,
  })
  companyIdentifier!: string;
}

export class SignUpByEmailRequest extends BaseSignUpByEmailRequest {}

export class SignUpByEmailResponse {
  /**
   * id of approval entity, for future reuse
   * */
  @Expose()
  approvalId!: string;
  /**
   * payloads for token generation, useful in case if we want user in without verification
   * */
  @Expose()
  jwtPayload!: JwtTokensPayload;
}

export class SignUpByEmailResponseDTO extends OmitType(SignUpByEmailResponse, [
  'jwtPayload',
] as const) {
  @Expose()
  message!: string;
}
