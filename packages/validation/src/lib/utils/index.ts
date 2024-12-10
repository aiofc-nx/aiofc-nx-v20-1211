import {
  i18nValidationMessage,
  i18nValidationMessageString,
  Path,
} from '@aiofc/i18n';
import { I18nTranslations } from '../generated/i18n.generated';

/**
 * 国际化工具函数
 *
 * @description
 * 提供两个工具函数用于处理国际化:
 * 1. i18nString - 用于获取国际化字符串
 * 2. i18n - 用于获取带参数的国际化消息
 */

/**
 * 获取国际化字符串
 *
 * @description
 * 用于获取不带参数的国际化字符串:
 * 1. 接收一个国际化键名
 * 2. 返回对应的国际化字符串
 *
 * @param key - 国际化键名路径
 * @returns 国际化字符串
 */
export function i18nString(key: Path<I18nTranslations>) {
  return i18nValidationMessageString<I18nTranslations>(key);
}

/**
 * 获取国际化消息
 *
 * @description
 * 用于获取带参数的国际化消息:
 * 1. 接收一个国际化键名和可选的参数
 * 2. 返回带参数替换的国际化消息
 *
 * @param key - 国际化键名路径
 * @param args - 可选的参数对象
 * @returns 国际化消息
 */
export function i18n(key: Path<I18nTranslations>, args?: unknown) {
  return i18nValidationMessage<I18nTranslations>(key, args);
}
