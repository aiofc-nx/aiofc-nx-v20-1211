import { applyDecorators } from '@nestjs/common';
import { IsEmail, ValidationOptions } from 'class-validator';
import { TrimAndLowercase } from '../transforms/';
import { MaxLengthLocalized } from './primitives';
import { i18nValidationMessage } from '@aiofc/i18n';
import { IsEmailOptions } from 'validator/lib/isEmail';

/**
 * 邮箱验证选项接口
 *
 * @description
 * 定义邮箱验证的配置选项:
 * 1. maxLength - 邮箱最大长度,默认320
 * 2. trimAndLowercase - 是否转小写并去除空格,默认true
 * 3. maxLengthValidationOptions - 长度验证的选项
 * 4. isEmailOptions - 邮箱格式验证的选项
 * 5. emailValidationOptions - 邮箱验证的选项
 */
export interface IsEmailLocalizedOptions {
  maxLength?: number;
  trimAndLowercase?: boolean;
  maxLengthValidationOptions?: ValidationOptions;
  isEmailOptions?: IsEmailOptions;
  emailValidationOptions?: ValidationOptions;
}

/**
 * 邮箱验证装饰器
 *
 * @description
 * 组合多个邮箱相关的验证装饰器:
 * 1. TrimAndLowercase - 转小写并去除空格(可选)
 * 2. MaxLengthLocalized - 验证最大长度
 * 3. IsEmail - 验证邮箱格式
 *
 * @param options - 邮箱验证选项,包含:
 * - maxLength: 最大长度,默认320
 * - trimAndLowercase: 是否转小写并去空格,默认true
 * - maxLengthValidationOptions: 长度验证选项
 * - isEmailOptions: 邮箱格式验证选项
 * - emailValidationOptions: 邮箱验证选项
 *
 * @returns 组合后的装饰器
 *
 * @example
 * class User {
 *   @IsEmailLocalized()
 *   email: string;
 * }
 */
export const IsEmailLocalized = ({
  maxLength = 320,
  trimAndLowercase = true,
  maxLengthValidationOptions = {},
  isEmailOptions = {},
  emailValidationOptions = {},
}: IsEmailLocalizedOptions = {}) => {
  const decorators = [
    trimAndLowercase ? TrimAndLowercase : undefined,
    MaxLengthLocalized(maxLength, {
      ...maxLengthValidationOptions,
    }),
    IsEmail(
      {
        ignore_max_length: true,
        ...isEmailOptions,
      },
      {
        ...emailValidationOptions,
        message: i18nValidationMessage('validation.INVALID_EMAIL'),
      },
    ),
  ].filter((v): v is PropertyDecorator => v !== undefined);
  return applyDecorators(...decorators);
};
