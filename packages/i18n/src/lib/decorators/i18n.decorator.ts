import { createParamDecorator } from '@nestjs/common';
import { I18nError } from '../i18n.error';
import { I18nContext } from '../i18n.context';
import { logger } from '../i18n.module';

/**
 * I18n 参数装饰器
 *
 * @description
 * 创建一个参数装饰器,用于获取当前请求的 I18nContext 实例:
 * - 使用 createParamDecorator 创建装饰器
 * - 从上下文中获取 I18nContext 实例
 * - 如果上下文不存在,抛出错误
 *
 * 主要功能:
 * 1. 获取当前请求的 I18nContext 实例
 * 2. 如果在非 HTTP 请求上下文中使用(如定时任务),提示使用 I18nService
 * 3. 如果无法获取上下文则抛出 I18nError
 *
 * @example
 * ```ts
 * @Get()
 * hello(@I18n() i18n: I18nContext) {
 *   return i18n.t('hello');
 * }
 * ```
 */
export const I18n = createParamDecorator((_, context) => {
  const i18n = I18nContext.current(context);

  if (i18n === undefined) {
    if (!i18n) {
      logger.error(
        'I18n context not found! Is this function triggered by a processor or cronjob? Please use the I18nService',
      );
    }
    throw new I18nError('I18n context undefined');
  }

  return i18n;
});
