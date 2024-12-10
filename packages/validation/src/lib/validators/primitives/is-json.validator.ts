import { IS_JSON, isJSON, IsJSON, ValidationOptions } from 'class-validator';
import { IValidatorDefinition } from '../dynamic';
import { i18n, i18nString } from '../../utils';

/**
 * JSON 格式验证相关常量和装饰器定义
 */

/** 验证失败时的错误消息 key */
const MESSAGE = 'validation.JSON';

/**
 * JSON 格式验证装饰器
 *
 * @description
 * 用于验证属性值是否为有效的 JSON 字符串:
 * 1. 使用 class-validator 的 IsJSON 进行验证
 * 2. 支持自定义验证选项
 * 3. 使用本地化的错误消息
 *
 * @param validationOptions - class-validator 的验证选项
 * @returns 属性装饰器
 *
 * @example
 * class Form {
 *   @IsJSONLocalized()
 *   config: string;
 * }
 */
export const IsJSONLocalized = (validationOptions: ValidationOptions = {}) =>
  IsJSON({
    message: i18n(MESSAGE),
    ...validationOptions,
  });

/**
 * JSON 格式验证器定义
 *
 * @description
 * 定义了 JSON 格式验证器的核心配置:
 * 1. name - 验证器名称,使用 class-validator 内置的 IS_JSON
 * 2. validator - 验证函数,使用 class-validator 的 isJSON
 * 3. defaultValidationMessage - 默认错误消息的 i18n key
 * 4. decorator - 使用上面定义的 IsJSONLocalized 装饰器
 */
export const IsJSONValidatorDefinition = {
  name: IS_JSON,
  validator: isJSON,
  defaultValidationMessage: i18nString(MESSAGE),
  decorator: IsJSONLocalized,
} satisfies IValidatorDefinition<boolean, undefined>;
