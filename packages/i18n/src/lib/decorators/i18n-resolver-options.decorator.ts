import { Inject } from '@nestjs/common';
import { I18N_RESOLVER_OPTIONS } from '../i18n.constants';

/**
 * 获取 I18n 解析器选项的注入令牌
 *
 * @description
 * 生成用于依赖注入的唯一令牌:
 * - 使用目标函数的名称和 I18N_RESOLVER_OPTIONS 常量组合
 * - 确保每个解析器的配置选项都有唯一的令牌
 *
 * @param target 目标函数
 * @returns 注入令牌字符串
 */
export function getI18nResolverOptionsToken(target: () => void) {
  return `${target.name}${I18N_RESOLVER_OPTIONS}`;
}

/**
 * I18nResolverOptions 参数装饰器
 *
 * @description
 * 创建一个参数装饰器,用于注入解析器的配置选项:
 * - 生成唯一的注入令牌
 * - 使用 @Inject 装饰器注入对应的配置
 *
 * 主要功能:
 * 1. 为每个解析器注入独立的配置选项
 * 2. 通过依赖注入系统管理配置
 *
 * @returns 参数装饰器工厂函数
 */
export function I18nResolverOptions(): any {
  /* 返回一个装饰器工厂函数
   * @param target - 被装饰的类
   * @param key - 被装饰的属性名
   * @param index - 被装饰的参数索引
   */
  return (target: () => void, key: string | symbol, index: number): unknown => {
    // 使用目标类生成唯一的注入令牌
    const token = getI18nResolverOptionsToken(target);

    // 使用生成的令牌创建 Inject 装饰器并应用到目标参数
    return Inject(token)(target, key, index);
  };
}
