import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { I18nContext } from '@aiofc/i18n';
import { ErrorResponse } from '../vo/error-response.dto';
import { I18nTranslations } from '../generated/i18n.generated';


/**
 * 全局异常过滤器
 *
 * @description
 * 该类用于捕获并处理应用中的所有未处理异常:
 * 1. 使用@Catch()装饰器捕获所有类型的异常
 * 2. 实现ExceptionFilter接口
 * 3. 提供统一的错误响应格式
 * 4. 支持国际化的错误消息
 * 5. 记录错误日志
 */
@Catch()
export class AnyExceptionFilter implements ExceptionFilter {
  /**
   * 创建日志记录器实例
   */
  private readonly logger = new Logger(AnyExceptionFilter.name);

  /**
   * 构造函数
   * @param httpAdapterHost HTTP适配器宿主,用于获取底层HTTP处理器
   */
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  /**
   * 异常处理方法
   *
   * @param exception 捕获到的异常对象
   * @param host 参数宿主上下文
   */
  catch(exception: unknown, host: ArgumentsHost): void {
    // 获取HTTP适配器
    const { httpAdapter } = this.httpAdapterHost;

    // 切换到HTTP上下文
    const ctx = host.switchToHttp();

    /**
     * 特殊处理服务不可用异常
     * 用于健康检查端点
     */
    if (exception instanceof ServiceUnavailableException) {
      httpAdapter.reply(ctx.getResponse(), exception.getResponse(), 503);
    }

    // 获取国际化上下文
    const i18n = I18nContext.current<I18nTranslations>(host);

    /**
     * 构造错误响应对象
     * 包含:
     * - type: 文档链接(待实现)
     * - title: 错误标题(国际化)
     * - detail: 错误详情(国际化)
     * - status: HTTP状态码
     * - instance: 请求ID
     */
    const response = {
      type: 'todo implement link to the docs, get from config',
      title:
        i18n?.translate('exception.INTERNAL_ERROR.TITLE') ??
        /* istanbul ignore next */ 'Internal Error',
      detail:
        i18n?.translate('exception.INTERNAL_ERROR.GENERAL_DETAIL').toString() ??
        /* istanbul ignore next */
        'Internal Server Error 500',
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      instance: ctx.getRequest().id,
    } satisfies ErrorResponse;

    // 记录错误日志
    this.logger.error(
      {
        err: exception,
      },
      `Unexpected error happen, this require immediate attention`,
    );

    // 发送错误响应
    httpAdapter.reply(ctx.getResponse(), response, response.status);
  }
}
