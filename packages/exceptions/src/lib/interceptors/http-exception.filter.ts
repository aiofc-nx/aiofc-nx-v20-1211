import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { HttpAdapterHost } from '@nestjs/core';
import { I18nContext } from '@aiofc/i18n';
import { AbstractHttpException } from '../exceptions/abstract-http.exception';
/**
 * HTTP异常过滤器
 *
 * @description
 * 该类用于处理所有继承自AbstractHttpException的异常:
 * 1. 使用@Catch装饰器捕获AbstractHttpException类型的异常
 * 2. 实现ExceptionFilter接口
 * 3. 提供统一的错误响应格式
 * 4. 支持国际化的错误消息
 * 5. 记录错误日志
 * 6. 支持设置自定义响应头
 */
@Catch(AbstractHttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  /**
   * 创建日志记录器实例
   */
  private readonly logger: Logger = new Logger(HttpExceptionFilter.name);

  /**
   * 构造函数
   * @param httpAdapterHost HTTP适配器宿主,用于获取底层HTTP处理器
   */
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  /**
   * 异常处理方法
   *
   * @param exception 捕获到的AbstractHttpException异常
   * @param host 参数宿主上下文
   */
  catch(exception: AbstractHttpException, host: ArgumentsHost): void {
    // 获取HTTP适配器
    // 注意:在某些情况下,httpAdapter可能在构造函数中不可用,因此需要在这里解析
    const { httpAdapter } = this.httpAdapterHost;

    // 切换到HTTP上下文
    const ctx = host.switchToHttp();
    // 获取国际化上下文
    const i18n = I18nContext.current(host);

    // 设置预定义的响应头
    this.presetHeaders(exception, ctx);

    // 根据状态码记录不同级别的日志
    if (exception.status > 499) {
      // 服务器错误,记录error级别日志
      this.logger.error(
        {
          err: exception,
        },
        'Internal server error. Require immediate attention!',
      );
    } else {
      // 客户端错误,记录info级别日志
      this.logger.log(
        {
          err: exception,
        },
        `Exception happened with status ${exception.status}`,
      );
    }

    // 构造错误响应
    const response = exception.toErrorResponse(ctx.getRequest().id, i18n);

    // 发送响应
    httpAdapter.reply(ctx.getResponse(), response, response.status);
  }

  /**
   * 设置预定义的响应头
   *
   * @description
   * 该方法会修改响应对象的头部信息
   * 通过遍历异常对象提供的预设头部值进行设置
   *
   * @param exception AbstractHttpException异常对象
   * @param ctx HTTP上下文
   */
  private presetHeaders(
    exception: AbstractHttpException,
    ctx: HttpArgumentsHost,
  ) {
    for (const [key, value] of Object.entries(
      exception.getPresetHeadersValues(),
    )) {
      ctx.getResponse().header(key, value);
    }
  }
}
