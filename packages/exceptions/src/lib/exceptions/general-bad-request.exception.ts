import { HttpStatus } from '@nestjs/common';
import { I18nValidationError, I18nValidationException } from '@aiofc/i18n';
import { ErrorResponse } from '../vo/error-response.dto';
import { i18nString } from '../utils/i18n';
/**
 * 通用错误请求异常类
 *
 * @description
 * 该类用于处理通用的错误请求异常:
 * 1. 继承自I18nValidationException基类,用于处理验证错误
 * 2. 构造函数接收:
 *    - errors: 单个或多个验证错误对象
 *    - detail: 可选的错误详情
 *    - errorCode: 可选的错误代码
 *    - rootCause: 可选的根本原因
 * 3. 重写toErrorResponse方法,返回标准错误响应格式:
 *    - 国际化的错误标题和详情
 *    - HTTP 400状态码
 *    - 错误代码等信息
 *
 * @example
 * throw new GeneralBadRequestException(
 *   validationErrors,  // 验证错误
 *   '请求参数无效',    // 错误详情
 *   'ERR_001',       // 错误代码
 *   error            // 原始错误
 * );
 */
export class GeneralBadRequestException extends I18nValidationException {
  constructor(
    errors: I18nValidationError | I18nValidationError[],
    public detail?: string,
    public errorCode?: string,
    public rootCause?: unknown,
  ) {
    super(Array.isArray(errors) ? errors : [errors], HttpStatus.BAD_REQUEST);
  }

  toErrorResponse(): Omit<ErrorResponse, 'data' | 'instance'> {
    return {
      title: i18nString('exception.BAD_REQUEST.TITLE'),
      detail: this.detail ?? i18nString('exception.BAD_REQUEST.GENERAL_DETAIL'),
      status: HttpStatus.BAD_REQUEST,
      type: 'todo implement link to docs',
      errorCode: this.errorCode,
    };
  }
}
