import { AbstractHttpException } from './abstract-http.exception';
import { CONTENT_VERSION_HEADER } from '../utils/constants';
import { i18nString } from '../utils/i18n';
import { HttpStatus } from '@nestjs/common';
import { OptimisticLockData } from './vo/optimistic-lock.dto';

/**
 * 乐观锁异常类
 *
 * @description
 * 该类用于处理乐观锁冲突的异常情况:
 * 1. 继承自AbstractHttpException基类,使用OptimisticLockData作为泛型参数
 * 2. 构造函数接收:
 *    - currentVersion: 当前版本号
 *    - rootCause: 可选的根本原因
 * 3. 通过super调用父类构造函数,设置:
 *    - 国际化的错误标题和详情
 *    - HTTP 409冲突状态码
 *    - 当前版本号作为额外数据
 *    - 根本原因(如果提供)
 * 4. 重写getPresetHeadersValues方法:
 *    - 返回包含当前版本号的响应头
 *
 * @example
 * throw new OptimisticLockException(
 *   1,        // 当前版本号
 *   error     // 原始错误
 * );
 */
export class OptimisticLockException extends AbstractHttpException<OptimisticLockData> {
  constructor(
    public readonly currentVersion: number,
    rootCause?: unknown,
  ) {
    super(
      i18nString('exception.CONFLICT.TITLE'),
      i18nString('exception.CONFLICT.OPTIMISTIC_LOCK'),
      HttpStatus.CONFLICT,
      { currentVersion },
      undefined,
      rootCause,
    );
  }

  override getPresetHeadersValues(): Record<string, string> {
    return {
      [CONTENT_VERSION_HEADER]: this.currentVersion.toString(),
    };
  }
}
