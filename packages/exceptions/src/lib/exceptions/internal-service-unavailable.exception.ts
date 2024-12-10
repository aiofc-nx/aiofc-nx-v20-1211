import { HttpStatus } from '@nestjs/common';
import { AbstractHttpException } from './abstract-http.exception';
import { i18nString } from '../utils/i18n';

/**
 * 内部服务不可用异常类
 *
 * @description
 * 该类用于处理内部服务不可用的异常:
 * 1. 继承自AbstractHttpException基类
 * 2. 构造函数接收:
 *    - externalServiceIdentifier: 可选的外部服务标识符
 *    - errorCode: 可选的错误代码
 *    - rootCause: 可选的根本原因
 * 3. 通过super调用父类构造函数,设置:
 *    - 国际化的错误标题和详情
 *    - HTTP 503服务不可用状态码
 *    - 外部服务标识符
 *    - 错误代码和根本原因(如果提供)
 *
 * @example
 * throw new InternalServiceUnavailableHttpException(
 *   'payment-service',  // 外部服务标识符
 *   'ERR_001',         // 错误代码
 *   error              // 原始错误
 * );
 */
export class InternalServiceUnavailableHttpException extends AbstractHttpException {
  constructor(
    externalServiceIdentifier?: string,
    errorCode?: string,
    rootCause?: unknown,
  ) {
    super(
      i18nString('exception.SERVICE_UNAVAILABLE.TITLE'),
      i18nString('exception.SERVICE_UNAVAILABLE.GENERAL_DETAIL'),
      HttpStatus.SERVICE_UNAVAILABLE,
      {
        externalServiceIdentifier,
      },
      errorCode,
      rootCause,
    );
  }
}
