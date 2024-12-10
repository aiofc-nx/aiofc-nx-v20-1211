import { IValidatorDefinition } from '../dynamic';
import {
  IS_DATE_STRING,
  IsDateString,
  isDateString,
  ValidationOptions,
} from 'class-validator';
import { i18n, i18nString } from '../../utils';
import { IsISO8601Options } from 'validator/lib/isISO8601';
/**
 * 日期类型验证相关常量和装饰器定义
 */

/** 验证失败时的错误消息 key */
const MESSAGE = 'validation.DATE';

/**
 * 日期类型验证装饰器
 *
 * @description
 * 用于验证属性值是否为有效的日期字符串:
 * 1. 使用 class-validator 的 IsDateString 进行验证
 * 2. 支持配置 ISO8601 日期格式选项
 * 3. 默认启用严格模式和严格分隔符检查
 * 4. 使用本地化的错误消息
 *
 * @param dateOptions - ISO8601 日期格式选项
 * @param validationOptions - class-validator 的验证选项
 * @returns 属性装饰器
 *
 * @example
 * class Form {
 *   @IsDateLocalized()
 *   createdAt: string;
 * }
 */
export const IsDateLocalized = (
  dateOptions: IsISO8601Options = {},
  validationOptions: ValidationOptions = {},
) =>
  IsDateString(
    {
      ...dateOptions,
      strict: true,
      strictSeparator: true,
    },
    {
      message: i18n(MESSAGE),
      ...validationOptions,
    },
  );

/**
 * 日期类型验证器定义
 *
 * @description
 * 定义了日期类型验证器的核心配置:
 * 1. name - 验证器名称,使用 class-validator 内置的 IS_DATE_STRING
 * 2. validator - 验证函数,使用 class-validator 的 isDateString
 * 3. defaultValidationMessage - 默认错误消息的 i18n key
 * 4. decorator - 使用上面定义的 IsDateLocalized 装饰器
 */
export const IsDateValidatorDefinition = {
  name: IS_DATE_STRING,
  validator: isDateString,
  defaultValidationMessage: i18nString(MESSAGE),
  decorator: IsDateLocalized,
} satisfies IValidatorDefinition<string, IsISO8601Options>;
