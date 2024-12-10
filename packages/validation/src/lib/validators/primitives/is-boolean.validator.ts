import {
  IS_BOOLEAN,
  isBoolean,
  IsBoolean,
  ValidationOptions,
} from 'class-validator';
import { IValidatorDefinition } from '../dynamic';
import { i18n, i18nString } from '../../utils';

/**
 * 布尔类型验证相关常量和装饰器定义
 */

/** 验证失败时的错误消息 key */
const MESSAGE = 'validation.BOOLEAN';

/**
 * 布尔类型验证装饰器
 *
 * @description
 * 用于验证属性值是否为布尔类型:
 * 1. 使用 class-validator 的 IsBoolean 进行验证
 * 2. 支持自定义验证选项
 * 3. 使用本地化的错误消息
 *
 * @param validationOptions - class-validator 的验证选项
 * @returns 属性装饰器
 *
 * @example
 * class Form {
 *   @IsBooleanLocalized()
 *   isActive: boolean;
 * }
 */
export const IsBooleanLocalized = (validationOptions: ValidationOptions = {}) =>
  IsBoolean({
    message: i18n(MESSAGE),
    ...validationOptions,
  });

/**
 * 布尔类型验证器定义
 *
 * @description
 * 定义了布尔类型验证器的核心配置:
 * 1. name - 验证器名称,使用 class-validator 内置的 IS_BOOLEAN
 * 2. validator - 验证函数,使用 class-validator 的 isBoolean
 * 3. defaultValidationMessage - 默认错误消息的 i18n key
 * 4. decorator - 使用上面定义的 IsBooleanLocalized 装饰器
 */
export const IsBooleanValidatorDefinition = {
  name: IS_BOOLEAN,
  validator: isBoolean,
  defaultValidationMessage: i18nString(MESSAGE),
  decorator: IsBooleanLocalized,
} satisfies IValidatorDefinition<boolean, undefined>;
