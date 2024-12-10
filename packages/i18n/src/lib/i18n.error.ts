/**
 * I18n 错误类
 *
 * @description
 * 用于处理国际化相关的错误:
 * - 继承自 Error 基类
 * - 设置错误名称为 'I18nError'
 * - 通过构造函数接收错误消息
 *
 * @example
 * throw new I18nError('Missing translation key');
 */
export class I18nError extends Error {
  constructor(message: string) {
    // 调用父类构造函数设置错误消息
    super(message);
    // 设置错误名称为 'I18nError'
    this.name = 'I18nError';
  }
}
