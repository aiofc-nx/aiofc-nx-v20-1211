import { I18nTranslations } from '../generated/i18n.generated';

import { i18nValidationMessageString, Path } from '@aiofc/i18n';

/**
 * 国际化字符串工具函数
 *
 * @description
 * 该函数是对 i18nValidationMessageString 的封装,用于简化国际化字符串的获取:
 * 1. 接收一个类型安全的翻译键路径参数
 * 2. 返回对应的国际化验证消息字符串
 * 3. 通过泛型约束确保翻译键的类型安全
 *
 * @param key - 翻译键路径,类型受I18nTranslations约束
 * @returns 对应的国际化验证消息字符串
 *
 * @example
 * // 获取验证错误消息
 * const message = i18nString('validation.string.NOT_EMPTY');
 */
export function i18nString(key: Path<I18nTranslations>) {
  return i18nValidationMessageString<I18nTranslations>(key);
}
