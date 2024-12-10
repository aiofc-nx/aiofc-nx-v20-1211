import { IValidatorDefinition } from '../dynamic';
import {
  IsNumberString as IsNumberStringDecorator,
  ValidationOptions,
} from 'class-validator';
import { i18n, i18nString } from '../../utils';

/**
 * 字符串整数验证相关常量和装饰器定义
 */

/** 验证失败时的错误消息 key */
const MESSAGE = 'validation.IS_STRING_INTEGER';

/**
 * 字符串整数验证装饰器
 *
 * @description
 * 用于验证字符串属性值是否为有效的整数格式:
 * 1. 使用 class-validator 的 IsNumberString 进行验证
 * 2. 配置 no_symbols=true 确保不包含特殊符号
 * 3. 支持自定义验证选项
 * 4. 使用本地化的错误消息
 *
 * @param validationOptions - class-validator 的验证选项
 * @returns 属性装饰器
 *
 * @example
 * class Form {
 *   @IsIntegerString()
 *   age: string;
 * }
 */
export const IsIntegerString = (validationOptions: ValidationOptions = {}) => {
  return IsNumberStringDecorator(
    {
      no_symbols: true,
    },
    { message: i18n(MESSAGE), ...validationOptions },
  );
};

/**
 * 字符串整数验证器定义
 *
 * @description
 * 定义了字符串整数验证器的核心配置:
 * 1. name - 验证器名称,使用自定义的 isStringInteger
 * 2. validator - 验证函数,用于验证字符串是否为有效的整数格式:
 *    - 不允许空字符串
 *    - 允许负号开头
 *    - 不允许前导零
 *    - 只允许数字字符
 * 3. defaultValidationMessage - 默认错误消息的 i18n key
 * 4. decorator - 使用上面定义的 IsIntegerString 装饰器
 */
export const IsStringIntegerValidatorDefinition = {
  name: 'isStringInteger',
  validator: (value: string) => {
    if (value.length === 0) {
      return false;
    }

    // 使用正则表达式验证:
    // ^-? - 可选的负号
    // (?!0\d) - 不允许以0开头的多位数
    // \d+ - 一个或多个数字
    return /^-?(?!0\d)\d+$/.test(value);
  },
  defaultValidationMessage: i18nString(MESSAGE),
  decorator: IsIntegerString,
} satisfies IValidatorDefinition<string, undefined>;
