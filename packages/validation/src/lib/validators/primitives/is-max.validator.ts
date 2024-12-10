import { max, MAX, Max, ValidationOptions } from 'class-validator';
import { IValidatorDefinition } from '../dynamic';
import { i18n, i18nString } from '../../utils';

/**
 * 最大值验证相关常量和装饰器定义
 */

/** 验证失败时的错误消息 key */
const MESSAGE = 'validation.MAX';

/**
 * 最大值验证装饰器
 *
 * @description
 * 用于验证数值属性是否不超过指定的最大值:
 * 1. 使用 class-validator 的 Max 进行验证
 * 2. 支持自定义验证选项
 * 3. 使用本地化的错误消息
 *
 * @param n - 最大值限制
 * @param validationOptions - class-validator 的验证选项
 * @returns 属性装饰器
 *
 * @example
 * class Form {
 *   @MaxLocalized(100)
 *   score: number;
 * }
 */
export const MaxLocalized = (
  n: number,
  validationOptions: ValidationOptions = {},
) => Max(n, { message: i18n(MESSAGE), ...validationOptions });

/**
 * 最大值验证器定义
 *
 * @description
 * 定义了最大值验证器的核心配置:
 * 1. name - 验证器名称,使用 class-validator 内置的 MAX
 * 2. validator - 验证函数,使用 class-validator 的 max
 * 3. defaultValidationMessage - 默认错误消息的 i18n key
 * 4. decorator - 使用上面定义的 MaxLocalized 装饰器
 */
export const IsMaxValidatorDefinition = {
  name: MAX,
  validator: max,
  defaultValidationMessage: i18nString(MESSAGE),
  decorator: MaxLocalized,
} satisfies IValidatorDefinition<number, number>;
