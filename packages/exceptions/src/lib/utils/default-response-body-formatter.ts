import { ArgumentsHost } from '@nestjs/common';
import { ErrorResponse, GeneralBadRequestException } from '../../index';
import { I18nContext, I18nValidationException } from '@aiofc/i18n';

/**
 * 响应体格式化函数
 *
 * @description
 * 将验证异常转换为标准的错误响应格式:
 * 1. 获取请求ID作为错误实例标识
 * 2. 获取当前的国际化上下文
 * 3. 根据异常类型生成不同的错误响应:
 *    - 如果是GeneralBadRequestException,使用其内置的错误响应格式
 *    - 否则生成一个标准的验证错误响应
 *
 * @param host - 参数宿主对象,用于访问请求上下文
 * @param exc - 国际化验证异常对象
 * @param formattedErrors - 格式化后的错误信息
 * @returns 标准化的错误响应对象
 *
 * @example
 * // 返回示例
 * {
 *   type: "错误文档链接",
 *   title: "请求无效",
 *   detail: "无法验证请求体",
 *   status: 400,
 *   instance: "请求ID",
 *   data: {验证错误详情}
 * }
 */
export function responseBodyFormatter(
  host: ArgumentsHost,
  exc: I18nValidationException,
  formattedErrors: object,
): Record<string, unknown> {
  const instance = host.switchToHttp().getRequest().requestId;

  const ctx = I18nContext.current();

  return exc instanceof GeneralBadRequestException
    ? ({
        ...exc.toErrorResponse(),
        instance,
        data: formattedErrors,
      } satisfies ErrorResponse)
    : ({
        type: 'todo implement link to docs',
        title: ctx?.translate('exception.BAD_REQUEST.TITLE') || 'Bad Request',
        detail:
          ctx?.translate('exception.BAD_REQUEST.GENERAL_DETAIL') ||
          'Can not validate inbound request body',
        status: exc.getStatus(),
        instance,
        data: formattedErrors,
      } satisfies ErrorResponse);
}
