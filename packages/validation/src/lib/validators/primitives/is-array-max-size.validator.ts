import {
  ARRAY_MAX_SIZE,
  ArrayMaxSize,
  arrayMaxSize,
  ValidationOptions,
} from 'class-validator';
import { IValidatorDefinition } from '../dynamic';
import { i18n, i18nString } from '../../utils';
/**
 * 数组最大长度验证相关常量和装饰器定义
 */

/** 验证失败时的错误消息 key */
const MESSAGE = 'validation.ARRAY_MAX_SIZE';

/**
 * 数组最大长度验证装饰器
 *
 * @description
 * 用于验证数组长度是否小于等于指定的最大值:
 * 1. 使用 class-validator 的 ArrayMaxSize 进行验证
 * 2. 支持自定义验证选项
 * 3. 使用本地化的错误消息
 *
 * @param max - 数组的最大长度
 * @param validationOptions - class-validator 的验证选项
 * @returns 属性装饰器
 *
 * @example
 * class Form {
 *   @IsArrayMaxSizeLocalized(5)
 *   tags: string[];
 * }
 */
export const IsArrayMaxSizeLocalized = (
  max: number,
  validationOptions: ValidationOptions = {},
) =>
  ArrayMaxSize(max, {
    message: i18n(MESSAGE),
    ...validationOptions,
  });

/**
 * 数组最大长度验证器定义
 *
 * @description
 * 定义了数组最大长度验证器的核心配置:
 * 1. name - 验证器名称,使用 class-validator 内置的 ARRAY_MAX_SIZE
 * 2. validator - 验证函数,使用 class-validator 的 arrayMaxSize
 * 3. defaultValidationMessage - 默认错误消息的 i18n key
 * 4. decorator - 使用上面定义的 IsArrayMaxSizeLocalized 装饰器
 */
export const IsArrayMaxSizeValidatorDefinition = {
  name: ARRAY_MAX_SIZE,
  validator: arrayMaxSize,
  defaultValidationMessage: i18nString(MESSAGE),
  decorator: IsArrayMaxSizeLocalized,
} satisfies IValidatorDefinition<unknown, number>;
