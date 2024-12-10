import { ArgumentsHost } from '@nestjs/common';
import { AsyncLocalStorage } from 'node:async_hooks';
import { I18nTranslator, I18nValidationError } from './interfaces';
import { I18nService, TranslateOptions } from './services/i18n.service';
import { Path, PathValue } from './types';
import { getContextObject } from './utils';
/**
 * I18n 上下文类
 *
 * @description
 * 提供国际化翻译和验证功能的上下文类:
 * - 使用 AsyncLocalStorage 存储当前上下文
 * - 实现 I18nTranslator 接口
 * - 提供翻译和验证方法
 * - 支持同步和异步创建上下文
 */
export class I18nContext<K = Record<string, unknown>>
  implements I18nTranslator<K>
{
  /**
   * 使用 AsyncLocalStorage 存储当前 I18n 上下文
   */
  private static storage = new AsyncLocalStorage<I18nContext>();

  /**
   * 上下文实例计数器,用于生成唯一 ID
   */
  private static counter = 1;

  /**
   * 当前实例的唯一 ID
   */
  readonly id = I18nContext.counter++;

  /**
   * 构造函数
   * @param lang 当前语言
   * @param service I18n 服务实例
   */
  constructor(
    readonly lang: string,
    readonly service: I18nService<K>,
  ) {}

  /**
   * 获取当前 I18n 上下文
   */
  get i18n(): I18nContext<K> | undefined {
    return this;
  }

  /**
   * 同步创建 I18n 上下文
   * @param ctx I18n 上下文实例
   * @param next 下一步执行的函数
   */
  static create(ctx: I18nContext, next: (...args: any[]) => void): void {
    this.storage.run(ctx, next);
  }

  /**
   * 异步创建 I18n 上下文
   * @param ctx I18n 上下文实例
   * @param next 下一步执行的异步函数
   */
  static async createAsync<T>(
    ctx: I18nContext,
    next: (...args: any[]) => Promise<T>,
  ): Promise<T> {
    return this.storage.run(ctx, next);
  }

  /**
   * 获取当前 I18n 上下文
   * @param context 可选的 ArgumentsHost 参数
   * @returns 当前 I18n 上下文实例或 undefined
   */
  static current<K = Record<string, unknown>>(
    context?: ArgumentsHost,
  ): I18nContext<K> | undefined {
    const i18n = this.storage.getStore() as I18nContext<K> | undefined;

    if (!i18n && !!context) {
      return getContextObject(context)?.i18nContext;
    }

    if (!i18n) {
      return undefined;
    }

    return i18n;
  }

  /**
   * 翻译指定的键值
   * @param key 翻译键
   * @param options 翻译选项
   * @returns 翻译后的值
   */
  public translate<P extends Path<K> = any, R = PathValue<K, P>>(
    key: P,
    options?: TranslateOptions,
  ) {
    options = {
      lang: this.lang,
      ...options,
    };
    return this.service.translate<P, R>(key, options);
  }

  /**
   * translate 方法的简写形式
   * @param key 翻译键
   * @param options 翻译选项
   * @returns 翻译后的值
   */
  public t<P extends Path<K> = any, R = PathValue<K, P>>(
    key: P,
    options?: TranslateOptions,
  ) {
    return this.translate<P, R>(key, options);
  }

  /**
   * 验证值并返回国际化的验证错误
   * @param value 要验证的值
   * @param options 验证选项
   * @returns 验证错误数组
   */
  public validate(
    value: any,
    options?: TranslateOptions,
  ): Promise<I18nValidationError[]> {
    options = {
      lang: this.lang,
      ...options,
    };
    return this.service.validate(value, options);
  }
}
