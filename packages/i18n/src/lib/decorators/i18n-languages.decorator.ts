import { Inject } from '@nestjs/common';
import { I18N_LANGUAGES } from '../i18n.constants';

/**
 * I18nLanguages 属性装饰器
 *
 * @description
 * 创建一个属性装饰器,用于注入支持的语言列表:
 * - 使用 @Inject 装饰器注入 I18N_LANGUAGES 常量
 * - I18N_LANGUAGES 包含了系统支持的所有语言代码
 *
 * 主要功能:
 * 1. 注入系统配置的支持语言列表
 * 2. 用于在需要获取支持语言的地方进行依赖注入
 *
 * @example
 * ```ts
 * class Service {
 *   @I18nLanguages()
 *   private languages: string[];
 * }
 * ```
 */
export const I18nLanguages = () => {
  return Inject(I18N_LANGUAGES);
};
