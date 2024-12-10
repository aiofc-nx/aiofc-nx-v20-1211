import { applyDecorators } from '@nestjs/common';
import { Matches, ValidatorOptions } from 'class-validator';
import { MaxLengthLocalized } from './primitives/is-max-length.validator';
import { MinLengthLocalized } from './primitives/is-min-length.validator';
import { i18nString } from '../utils';
/**
 * 密码验证相关接口和装饰器定义
 */

/**
 * 密码验证选项接口
 *
 * @description
 * 定义了密码验证所需的配置选项:
 * 1. minLength - 密码最小长度,默认为8
 * 2. maxLength - 密码最大长度,默认为128
 * 3. pattern - 密码匹配的正则表达式模式
 * 4. 各种验证选项的配置对象
 */
export interface PasswordLocalizedOptions {
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  minLengthValidationOptions?: ValidatorOptions;
  maxLengthValidationOptions?: ValidatorOptions;
  passwordValidationOptions?: ValidatorOptions;
}

/**
 * 密码验证装饰器
 *
 * @description
 * 组合多个验证规则来验证密码:
 * 1. 长度验证 - 使用 MinLengthLocalized 和 MaxLengthLocalized
 * 2. 格式验证 - 使用正则表达式验证密码必须包含:
 *    - 至少一个字母(大写或小写)
 *    - 至少一个数字
 *    - 至少一个特殊字符(!#$%&*?@^-)
 *    - 最小长度为8位
 *
 * @param options - 密码验证的配置选项
 * @returns 组合后的装饰器
 *
 * @example
 * class UserForm {
 *   @PasswordLocalized()
 *   password: string;
 * }
 */
export const PasswordLocalized = ({
  minLength = 8,
  maxLength = 128,
  pattern = /^(?=.*?[A-Za-z])(?=.*?\d)(?=.*?[!#$%&*?@^-]).{8,}$/,
  minLengthValidationOptions = {},
  maxLengthValidationOptions = {},
  passwordValidationOptions = {},
}: PasswordLocalizedOptions = {}) => {
  return applyDecorators(
    MinLengthLocalized(minLength, minLengthValidationOptions),
    MaxLengthLocalized(maxLength, maxLengthValidationOptions),
    Matches(pattern, {
      message: i18nString('validation.PASSWORD_DOESNT_MATCH_CONSTRAINTS'),
      ...passwordValidationOptions,
    }),
  );
};
