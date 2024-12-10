import { HttpStatus } from '@nestjs/common';
import { i18nString } from '../utils/i18n';
import { AbstractHttpException } from './abstract-http.exception';

/**
 * 通用无法处理实体异常类
 *
 * @description
 * 该类用于处理通用的无法处理实体异常:
 * 1. 继承自AbstractHttpException基类
 * 2. 构造函数接收:
 *    - detail: 可选的错误详情
 *    - errorCode: 可选的错误代码
 *    - rootCause: 可选的根本原因
 * 3. 通过super调用父类构造函数,设置:
 *    - 国际化的错误标题和详情
 *    - HTTP 422无法处理实体状态码
 *    - 错误代码和根本原因(如果提供)
 *
 * @example
 * throw new GeneralUnprocessableEntityException(
 *   '无法处理的数据格式',  // 错误详情
 *   'ERR_001',          // 错误代码
 *   error               // 原始错误
 * );
 */
export class GeneralUnprocessableEntityException extends AbstractHttpException {
  constructor(detail?: string, errorCode?: string, rootCause?: unknown) {
    super(
      i18nString('exception.UNPROCESSABLE_ENTITY.TITLE'),
      detail ?? i18nString('exception.UNPROCESSABLE_ENTITY.GENERAL_DETAIL'),
      HttpStatus.UNPROCESSABLE_ENTITY,
      undefined,
      errorCode,
      rootCause,
    );
  }
}
