import { MATCHES, Matches, matches, ValidationOptions } from 'class-validator';
import { IValidatorDefinition } from '../dynamic';
import { i18n } from '../../utils';

/**
 * 正则表达式验证相关常量和装饰器定义
 */

/** 验证失败时的错误消息 key */
const MESSAGE = 'validation.REGEXP';

/**
 * 正则表达式验证装饰器
 *
 * @description
 * 用于验证属性值是否匹配指定的正则表达式:
 * 1. 使用 class-validator 的 Matches 进行验证
 * 2. 支持自定义正则表达式模式和验证选项
 * 3. 使用本地化的错误消息
 *
 * @param pattern - 需要匹配的正则表达式
 * @param validationOptions - class-validator 的验证选项
 * @returns 属性装饰器
 *
 * @example
 * class Form {
 *   @MatchesRegexpLocalized(/^[A-Z]+$/)
 *   code: string;
 * }
 */
export const MatchesRegexpLocalized = (
  pattern: RegExp,
  validationOptions: ValidationOptions = {},
) =>
  Matches(pattern, {
    message: i18n(MESSAGE),
    ...validationOptions,
  });

/**
 * 正则表达式验证器定义
 *
 * @description
 * 定义了正则表达式验证器的核心配置:
 * 1. name - 验证器名称,使用 class-validator 内置的 MATCHES
 * 2. validator - 验证函数,使用 class-validator 的 matches
 * 3. defaultValidationMessage - 默认错误消息的 i18n key
 * 4. decorator - 使用上面定义的 MatchesRegexpLocalized 装饰器
 */
export const MatchesRegexpValidatorDefinition = {
  name: MATCHES,
  validator: matches,
  defaultValidationMessage: MESSAGE,
  decorator: MatchesRegexpLocalized,
} satisfies IValidatorDefinition<string, RegExp>;
