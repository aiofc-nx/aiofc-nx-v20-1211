import {
  IS_OBJECT,
  isObject,
  IsObject,
  ValidationOptions,
} from 'class-validator';
import { IValidatorDefinition } from '../dynamic';
import { i18n } from '../../utils';

/**
 * 对象类型验证相关常量和装饰器定义
 */

/** 验证失败时的错误消息 key */
const MESSAGE = 'validation.OBJECT';

/**
 * 对象类型验证装饰器
 *
 * @description
 * 用于验证属性值是否为对象类型:
 * 1. 使用 class-validator 的 IsObject 进行验证
 * 2. 支持自定义验证选项
 * 3. 使用本地化的错误消息
 *
 * @param validationOptions - class-validator 的验证选项
 * @returns 属性装饰器
 *
 * @example
 * class Form {
 *   @IsObjectLocalized()
 *   config: object;
 * }
 */
export const IsObjectLocalized = (validationOptions: ValidationOptions = {}) =>
  IsObject({
    message: i18n(MESSAGE),
    ...validationOptions,
  });

/**
 * 对象类型验证器定义
 *
 * @description
 * 定义了对象类型验证器的核心配置:
 * 1. name - 验证器名称,使用 class-validator 内置的 IS_OBJECT
 * 2. validator - 验证函数,使用 class-validator 的 isObject
 * 3. defaultValidationMessage - 默认错误消息的 i18n key
 * 4. decorator - 使用上面定义的 IsObjectLocalized 装饰器
 */
export const IsObjectValidatorDefinition = {
  name: IS_OBJECT,
  validator: isObject,
  defaultValidationMessage: MESSAGE,
  decorator: IsObjectLocalized,
} satisfies IValidatorDefinition<boolean, undefined>;
