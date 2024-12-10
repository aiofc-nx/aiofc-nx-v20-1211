import { IValidatorDefinition } from '../dynamic';
import {
  IS_NUMBER,
  isNumber,
  IsNumber,
  IsNumberOptions,
  ValidationOptions,
} from 'class-validator';
import { i18n, i18nString } from '../../utils';

/**
 * 数值类型验证相关常量和装饰器定义
 */

/** 验证失败时的错误消息 key */
const MESSAGE = 'validation.NUMBER';

/**
 * 数值类型验证装饰器
 *
 * @description
 * 用于验证属性值是否为数值类型:
 * 1. 使用 class-validator 的 IsNumber 进行验证
 * 2. 支持自定义数值验证选项和验证选项
 * 3. 使用本地化的错误消息
 *
 * @param isNumberOptions - class-validator 的数值验证选项
 * @param validationOptions - class-validator 的验证选项
 * @returns 属性装饰器
 *
 * @example
 * class Form {
 *   @IsNumberLocalized()
 *   age: number;
 * }
 */
export const IsNumberLocalized = (
  isNumberOptions: IsNumberOptions = {},
  validationOptions: ValidationOptions = {},
) => {
  return IsNumber(isNumberOptions, {
    message: i18n(MESSAGE),
    ...validationOptions,
  });
};

/**
 * 数值类型验证器定义
 *
 * @description
 * 定义了数值类型验证器的核心配置:
 * 1. name - 验证器名称,使用 class-validator 内置的 IS_NUMBER
 * 2. validator - 验证函数,使用 class-validator 的 isNumber
 * 3. defaultValidationMessage - 默认错误消息的 i18n key
 * 4. decorator - 使用上面定义的 IsNumberLocalized 装饰器
 */
export const IsNumberValidatorDefinition = {
  name: IS_NUMBER,
  validator: isNumber,
  defaultValidationMessage: i18nString(MESSAGE),
  decorator: IsNumberLocalized,
} satisfies IValidatorDefinition<number, IsNumberOptions>;
