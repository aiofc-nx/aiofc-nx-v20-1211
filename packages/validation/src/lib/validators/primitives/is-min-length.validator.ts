import {
  MIN_LENGTH,
  minLength,
  MinLength,
  ValidationOptions,
} from 'class-validator';
import { IValidatorDefinition } from '../dynamic';
import { i18nValidationMessage } from '@aiofc/i18n';
import { i18nString } from '../../utils';

/**
 * 字符串最小长度验证相关常量和装饰器定义
 */

/** 验证失败时的错误消息 key */
const MESSAGE = 'validation.MIN_STRING_LENGTH';

/**
 * 字符串最小长度验证装饰器
 *
 * @description
 * 用于验证字符串属性值的长度是否不小于指定的最小值:
 * 1. 使用 class-validator 的 MinLength 进行验证
 * 2. 支持自定义验证选项
 * 3. 使用本地化的错误消息
 *
 * @param n - 最小长度限制
 * @param validationOptions - class-validator 的验证选项
 * @returns 属性装饰器
 *
 * @example
 * class Form {
 *   @MinLengthLocalized(6)
 *   password: string;
 * }
 */
export const MinLengthLocalized = (
  n: number,
  validationOptions?: ValidationOptions,
) =>
  MinLength(n, {
    message: i18nValidationMessage(MESSAGE),
    ...validationOptions,
  });

/**
 * 字符串最小长度验证器定义
 *
 * @description
 * 定义了字符串最小长度验证器的核心配置:
 * 1. name - 验证器名称,使用 class-validator 内置的 MIN_LENGTH
 * 2. validator - 验证函数,使用 class-validator 的 minLength
 * 3. defaultValidationMessage - 默认错误消息的 i18n key
 * 4. decorator - 使用上面定义的 MinLengthLocalized 装饰器
 */
export const MinValidatorDefinition = {
  name: MIN_LENGTH,
  validator: minLength,
  defaultValidationMessage: i18nString(MESSAGE),
  decorator: MinLengthLocalized,
} satisfies IValidatorDefinition<string, number>;
