import {
  ARRAY_MIN_SIZE,
  arrayMinSize,
  ArrayMinSize,
  ValidationOptions,
} from 'class-validator';
import { IValidatorDefinition } from '../dynamic';
import { i18n, i18nString } from '../../utils';

/**
 * 数组最小长度验证相关常量和装饰器定义
 */

/** 验证失败时的错误消息 key */
const MESSAGE = 'validation.ARRAY_MIN_SIZE';

/**
 * 数组最小长度验证装饰器
 *
 * @description
 * 用于验证数组长度是否大于等于指定的最小值:
 * 1. 使用 class-validator 的 ArrayMinSize 进行验证
 * 2. 支持自定义验证选项
 * 3. 使用本地化的错误消息
 *
 * @param min - 数组的最小长度
 * @param validationOptions - class-validator 的验证选项
 * @returns 属性装饰器
 *
 * @example
 * class Form {
 *   @IsArrayMinSizeLocalized(3)
 *   tags: string[];
 * }
 */
export const IsArrayMinSizeLocalized = (
  min: number,
  validationOptions: ValidationOptions = {},
) =>
  ArrayMinSize(min, {
    message: i18n(MESSAGE),
    ...validationOptions,
  });

/**
 * 数组最小长度验证器定义
 *
 * @description
 * 定义了数组最小长度验证器的核心配置:
 * 1. name - 验证器名称,使用 class-validator 内置的 ARRAY_MIN_SIZE
 * 2. validator - 验证函数,使用 class-validator 的 arrayMinSize
 * 3. defaultValidationMessage - 默认错误消息的 i18n key
 * 4. decorator - 使用上面定义的 IsArrayMinSizeLocalized 装饰器
 */
export const IsArrayMinSizeValidatorDefinition = {
  name: ARRAY_MIN_SIZE,
  validator: arrayMinSize,
  defaultValidationMessage: i18nString(MESSAGE),
  decorator: IsArrayMinSizeLocalized,
} satisfies IValidatorDefinition<unknown, number>;
