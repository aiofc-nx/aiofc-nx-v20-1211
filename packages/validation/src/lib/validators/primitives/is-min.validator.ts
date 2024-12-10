import { IValidatorDefinition } from '../dynamic';
import { MIN, min, Min, ValidationOptions } from 'class-validator';
import { i18n, i18nString } from '../../utils';

/**
 * 最小值验证相关常量和装饰器定义
 */

/** 验证失败时的错误消息 key */
const MESSAGE = 'validation.MIN';

/**
 * 最小值验证装饰器
 *
 * @description
 * 用于验证数值属性是否不小于指定的最小值:
 * 1. 使用 class-validator 的 Min 进行验证
 * 2. 支持自定义验证选项
 * 3. 使用本地化的错误消息
 *
 * @param n - 最小值限制
 * @param validationOptions - class-validator 的验证选项
 * @returns 属性装饰器
 *
 * @example
 * class Form {
 *   @MinLocalized(0)
 *   age: number;
 * }
 */
export const MinLocalized = (
  n: number,
  validationOptions: ValidationOptions = {},
) => Min(n, { message: i18n(MESSAGE), ...validationOptions });

/**
 * 最小值验证器定义
 *
 * @description
 * 定义了最小值验证器的核心配置:
 * 1. name - 验证器名称,使用 class-validator 内置的 MIN
 * 2. validator - 验证函数,使用 class-validator 的 min
 * 3. defaultValidationMessage - 默认错误消息的 i18n key
 * 4. decorator - 使用上面定义的 MinLocalized 装饰器
 */
export const MinValidatorDefinition = {
  name: MIN,
  validator: min,
  defaultValidationMessage: i18nString(MESSAGE),
  decorator: MinLocalized,
} satisfies IValidatorDefinition<string, number>;
