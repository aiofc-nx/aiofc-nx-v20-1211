import {
  IS_NOT_EMPTY,
  isNotEmpty,
  IsNotEmpty,
  ValidationOptions,
} from 'class-validator';
import { IValidatorDefinition } from '../dynamic';
import { i18n, i18nString } from '../../utils';

/**
 * 非空验证相关常量和装饰器定义
 */

/** 验证失败时的错误消息 key */
const MESSAGE = 'validation.NOT_EMPTY';

/**
 * 非空验证装饰器
 *
 * @description
 * 用于验证属性值是否非空:
 * 1. 使用 class-validator 的 IsNotEmpty 进行验证
 * 2. 支持自定义验证选项
 * 3. 使用本地化的错误消息
 *
 * @param validationOptions - class-validator 的验证选项
 * @returns 属性装饰器
 *
 * @example
 * class Form {
 *   @IsNotEmptyLocalized()
 *   name: string;
 * }
 */
export const IsNotEmptyLocalized = (validationOptions?: ValidationOptions) =>
  IsNotEmpty({
    message: i18n(MESSAGE),
    ...validationOptions,
  });

/**
 * 非空验证器定义
 *
 * @description
 * 定义了非空验证器的核心配置:
 * 1. name - 验证器名称,使用 class-validator 内置的 IS_NOT_EMPTY
 * 2. validator - 验证函数,使用 class-validator 的 isNotEmpty
 * 3. defaultValidationMessage - 默认错误消息的 i18n key
 * 4. decorator - 使用上面定义的 IsNotEmptyLocalized 装饰器
 */
export const IsNotEmptyValidatorDefinition = {
  name: IS_NOT_EMPTY,
  validator: isNotEmpty,
  defaultValidationMessage: i18nString(MESSAGE),
  decorator: IsNotEmptyLocalized,
} satisfies IValidatorDefinition<string, undefined>;
