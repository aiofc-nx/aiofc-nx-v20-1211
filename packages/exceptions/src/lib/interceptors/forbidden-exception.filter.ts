import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  ForbiddenException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { I18nContext } from '@aiofc/i18n';
import { ErrorResponse } from '../vo/error-response.dto';
import { I18nTranslations } from '../generated/i18n.generated';

/**
 * 覆盖默认的禁止访问异常过滤器
 *
 * @description
 * 该类用于处理ForbiddenException异常:
 * 1. 使用@Catch装饰器捕获ForbiddenException
 * 2. 实现ExceptionFilter接口
 * 3. 提供统一的错误响应格式
 * 4. 支持国际化的错误消息
 */
@Catch(ForbiddenException)
export class OverrideDefaultForbiddenExceptionFilter
  implements ExceptionFilter
{
  /**
   * 构造函数
   * @param httpAdapterHost HTTP适配器宿主,用于获取底层HTTP处理器
   */
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  /**
   * 异常处理方法
   *
   * @param exception 捕获到的ForbiddenException异常
   * @param host 参数宿主上下文
   */
  catch(exception: ForbiddenException, host: ArgumentsHost): void {
    // 获取HTTP适配器
    // 注意:在某些情况下,httpAdapter可能在构造函数中不可用,因此需要在这里解析
    const { httpAdapter } = this.httpAdapterHost;

    // 切换到HTTP上下文
    const ctx = host.switchToHttp();
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
        i18n?.translate('exception.FORBIDDEN.TITLE') ??
        /* istanbul ignore next */ 'Forbidden',
      detail:
        i18n?.translate('exception.FORBIDDEN.GENERAL_DETAIL').toString() ??
        /* istanbul ignore next */
        'Forbidden access to the resource. Check permissions.',
      status: HttpStatus.FORBIDDEN,
      instance: ctx.getRequest().id,
    } satisfies ErrorResponse;

    // 发送响应
    httpAdapter.reply(ctx.getResponse(), response, response.status);
  }
}
