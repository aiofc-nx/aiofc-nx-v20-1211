import { HttpStatus } from '@nestjs/common';
import { AbstractHttpException } from './abstract-http.exception';
import { i18nString } from '../utils/i18n';

/**
 * 通用内部服务器错误异常类
 *
 * @description
 * 该类用于处理通用的内部服务器错误异常:
 * 1. 继承自AbstractHttpException基类
 * 2. 构造函数接收:
 *    - errorCode: 可选的错误代码
 *    - rootCause: 可选的根本原因
 * 3. 通过super调用父类构造函数,设置:
 *    - 国际化的错误标题和详情
 *    - HTTP 500内部服务器错误状态码
 *    - 错误代码和根本原因(如果提供)
 *
 * @example
 * throw new GeneralInternalServerException(
 *   'ERR_001',  // 错误代码
 *   error       // 原始错误
 * );
 */
export class GeneralInternalServerException extends AbstractHttpException {
  constructor(errorCode?: string, rootCause?: unknown) {
    super(
      i18nString('exception.INTERNAL_ERROR.TITLE'),
      i18nString('exception.INTERNAL_ERROR.GENERAL_DETAIL'),
      HttpStatus.INTERNAL_SERVER_ERROR,
      undefined,
      errorCode,
      rootCause,
    );
  }
}
