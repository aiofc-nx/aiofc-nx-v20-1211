import { HttpStatus } from '@nestjs/common';
import { AbstractHttpException } from './abstract-http.exception';
import { i18nString } from '../utils/i18n';
import { ObjectNotFoundData } from './vo/object-not-found.dto';

/**
 * 对象未找到异常类
 *
 * @description
 * 该类用于处理对象未找到的异常情况:
 * 1. 继承自AbstractHttpException基类,使用ObjectNotFoundData作为泛型参数
 * 2. 构造函数接收:
 *    - entityName: 未找到的实体名称
 *    - errorCode: 可选的错误代码
 *    - rootCause: 可选的根本原因
 * 3. 通过super调用父类构造函数,设置:
 *    - 国际化的错误标题和详情
 *    - HTTP 404未找到状态码
 *    - 实体名称作为额外数据
 *    - 错误代码和根本原因(如果提供)
 *
 * @example
 * throw new ObjectNotFoundException(
 *   'User',      // 实体名称
 *   'ERR_001',   // 错误代码
 *   error        // 原始错误
 * );
 */
export class ObjectNotFoundException extends AbstractHttpException<ObjectNotFoundData> {
  constructor(entityName: string, errorCode?: string, rootCause?: unknown) {
    super(
      i18nString('exception.NOT_FOUND.TITLE'),
      i18nString('exception.NOT_FOUND.OBJECT_NOT_FOUND_DETAIL'),
      HttpStatus.NOT_FOUND,
      { entityName },
      errorCode,
      rootCause,
    );
  }
}
