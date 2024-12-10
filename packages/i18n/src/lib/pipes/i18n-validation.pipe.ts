import {
  ArgumentMetadata,
  ValidationPipe,
  ValidationPipeOptions,
} from '@nestjs/common';
import { I18nContext } from '../i18n.context';
import { i18nValidationErrorFactory } from '../utils';

/**
 * I18nValidationPipeOptions 类型定义
 *
 * 从 ValidationPipeOptions 中排除 exceptionFactory 选项
 * 因为我们会使用自定义的 i18nValidationErrorFactory 来处理验证错误
 */
export type I18nValidationPipeOptions = Omit<
  ValidationPipeOptions,
  'exceptionFactory'
>;

/**
 * 国际化验证管道类
 *
 * @description
 * 继承自 @nestjs/common 的 ValidationPipe,添加了国际化支持:
 * - 使用 i18nValidationErrorFactory 处理验证错误,支持错误消息国际化
 * - 重写 toValidate 方法,跳过对 I18nContext 类型的验证
 * - 通过构造函数接收验证选项配置
 *
 * 主要功能:
 * 1. 对客户端请求数据进行验证
 * 2. 验证规则通过 DTO 类上的装饰器定义
 * 3. 验证失败时返回国际化的错误消息
 */
export class I18nValidationPipe extends ValidationPipe {
  /**
   * 构造函数
   * @param options 验证选项,不包含 exceptionFactory
   */
  constructor(options?: I18nValidationPipeOptions) {
    super({
      ...options,
      exceptionFactory: i18nValidationErrorFactory, // 使用自定义的错误工厂函数
    });
  }

  /**
   * 重写父类的 toValidate 方法
   *
   * @param metadata 参数元数据
   * @returns 是否需要验证该参数
   *
   * @description
   * - 跳过对 I18nContext 类型的验证
   * - 其他类型使用父类的验证逻辑
   */
  protected override toValidate(metadata: ArgumentMetadata): boolean {
    const { metatype } = metadata;
    return metatype !== I18nContext && super.toValidate(metadata);
  }
}
