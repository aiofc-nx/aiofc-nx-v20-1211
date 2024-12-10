import { HttpStatus } from '@nestjs/common';
import { AbstractHttpException } from './abstract-http.exception';
import { i18nString } from '../utils/i18n';

/**
 * 通用禁止访问异常类
 *
 * @description
 * 该类用于处理通用的禁止访问异常:
 * 1. 继承自AbstractHttpException基类
 * 2. 构造函数接收:
 *    - errorCode: 可选的错误代码
 *    - rootCause: 可选的根本原因
 * 3. 通过super调用父类构造函数,设置:
 *    - 国际化的错误标题和详情
 *    - HTTP 403禁止访问状态码
 *    - 错误代码和根本原因(如果提供)
 *
 * @example
 * throw new GeneralForbiddenException(
 *   'ERR_001',  // 错误代码
 *   error       // 原始错误
 * );
 */
export class GeneralForbiddenException extends AbstractHttpException {
  constructor(errorCode?: string, rootCause?: unknown) {
    super(
      i18nString('exception.FORBIDDEN.TITLE'),
      i18nString('exception.FORBIDDEN.GENERAL_DETAIL'),
      HttpStatus.FORBIDDEN,
      undefined,
      errorCode,
      rootCause,
    );
  }
}
