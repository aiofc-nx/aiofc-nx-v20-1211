import { IValidatorDefinition } from '../dynamic';
import { IS_URL, isURL, IsUrl, ValidationOptions } from 'class-validator';
import { i18n, i18nString } from '../../utils';
import { IsURLOptions } from 'validator/lib/isURL';

/**
 * URL 验证相关常量和装饰器定义
 */

/** 验证失败时的错误消息 key */
const MESSAGE = 'validation.URL';

/**
 * URL 验证装饰器
 *
 * @description
 * 用于验证属性值是否为有效的 URL:
 * 1. 使用 class-validator 的 IsUrl 进行验证
 * 2. 支持自定义 URL 验证选项和验证选项
 * 3. 使用本地化的错误消息
 *
 * @param opt - validator.js 的 URL 验证选项
 * @param validationOptions - class-validator 的验证选项
 * @returns 属性装饰器
 *
 * @example
 * class Form {
 *   @IsUrlLocalized()
 *   website: string;
 * }
 */
export const IsUrlLocalized = (
  opt: IsURLOptions = {},
  validationOptions: ValidationOptions = {},
) => IsUrl(opt, { message: i18n(MESSAGE), ...validationOptions });

/**
 * URL 验证器定义
 *
 * @description
 * 定义了 URL 验证器的核心配置:
 * 1. name - 验证器名称,使用 class-validator 内置的 IS_URL
 * 2. validator - 验证函数,使用 class-validator 的 isURL
 * 3. defaultValidationMessage - 默认错误消息的 i18n key
 * 4. decorator - 使用上面定义的 IsUrlLocalized 装饰器
 */
export const IsUrlValidatorDefinition = {
  name: IS_URL,
  validator: isURL,
  defaultValidationMessage: i18nString(MESSAGE),
  decorator: IsUrlLocalized,
} satisfies IValidatorDefinition<string, IsURLOptions>;
