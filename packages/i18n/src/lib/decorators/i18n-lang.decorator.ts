import { createParamDecorator } from '@nestjs/common';
import { I18nContext } from '../i18n.context';

/**
 * I18nLang 参数装饰器
 *
 * @description
 * 创建一个参数装饰器,用于获取当前请求的语言代码:
 * - 使用 createParamDecorator 创建装饰器
 * - 从上下文中获取 I18nContext 实例
 * - 返回 I18nContext 中的 lang 属性
 *
 * 主要功能:
 * 1. 获取当前请求的语言设置
 * 2. 如果上下文不存在,返回 undefined
 *
 * @example
 * ```ts
 * @Get()
 * hello(@I18nLang() lang: string) {
 *   return `Current language is: ${lang}`;
 * }
 * ```
 */
export const I18nLang = createParamDecorator((data, context) => {
  const i18n = I18nContext.current(context);

  return i18n?.lang;
});
