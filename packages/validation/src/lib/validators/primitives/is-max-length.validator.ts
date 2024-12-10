import {
  MAX_LENGTH,
  maxLength,
  MaxLength,
  ValidationOptions,
} from 'class-validator';
import { IValidatorDefinition } from '../dynamic';
import { i18n, i18nString } from '../../utils';

/**
 * 字符串最大长度验证相关常量和装饰器定义
 */

/** 验证失败时的错误消息 key */
const MESSAGE = 'validation.MAX_STRING_LENGTH';

/**
 * 字符串最大长度验证装饰器
 *
 * @description
 * 用于验证字符串属性值的长度是否不超过指定的最大值:
 * 1. 使用 class-validator 的 MaxLength 进行验证
 * 2. 支持自定义验证选项
 * 3. 使用本地化的错误消息
 *
 * @param n - 最大长度限制
 * @param validationOptions - class-validator 的验证选项
 * @returns 属性装饰器
 *
 * @example
 * class Form {
 *   @MaxLengthLocalized(100)
 *   description: string;
 * }
 */
export const MaxLengthLocalized = (
  n: number,
  validationOptions?: ValidationOptions,
) =>
  MaxLength(n, {
    message: i18n(MESSAGE),
    ...validationOptions,
  });

/**
 * 字符串最大长度验证器定义
 *
 * @description
 * 定义了字符串最大长度验证器的核心配置:
 * 1. name - 验证器名称,使用 class-validator 内置的 MAX_LENGTH
 * 2. validator - 验证函数,使用 class-validator 的 maxLength
 * 3. defaultValidationMessage - 默认错误消息的 i18n key
 * 4. decorator - 使用上面定义的 MaxLengthLocalized 装饰器
 */
export const IsMaxLengthValidatorDefinition = {
  name: MAX_LENGTH,
  validator: maxLength,
  defaultValidationMessage: i18nString(MESSAGE),
  decorator: MaxLengthLocalized,
} satisfies IValidatorDefinition<string, number>;
