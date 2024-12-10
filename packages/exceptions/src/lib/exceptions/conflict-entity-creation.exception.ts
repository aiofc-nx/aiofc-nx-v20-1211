import { HttpStatus } from '@nestjs/common';
import { AbstractHttpException } from './abstract-http.exception';
import { i18nString } from '../utils/i18n';
import { ConflictEntityCreationData } from './vo/conflict-entity-creation.dto';

/**
 * 实体创建冲突异常类
 *
 * @description
 * 该类用于处理实体创建时发生的冲突异常:
 * 1. 继承自AbstractHttpException基类,使用ConflictEntityCreationData作为附加数据类型
 * 2. 构造函数接收实体名称、冲突字段名和字段值等信息
 * 3. 通过super调用父类构造函数,设置:
 *    - 国际化的错误标题和详情
 *    - HTTP 409冲突状态码
 *    - 包含冲突信息的附加数据对象
 *    - 可选的错误代码和根本原因
 *
 * @example
 * throw new ConflictEntityCreationException(
 *   'User',           // 实体名称
 *   'email',          // 冲突字段
 *   'test@test.com',  // 冲突值
 *   'USER_001',       // 错误代码
 *   error            // 原始错误
 * );
 */
export class ConflictEntityCreationException extends AbstractHttpException<ConflictEntityCreationData> {
  constructor(
    public readonly entityName: string,
    public readonly fieldName: string,
    public readonly fieldValue: unknown,
    errorCode?: string,
    rootCause?: unknown,
  ) {
    super(
      i18nString('exception.CONFLICT.TITLE'),
      i18nString('exception.CONFLICT.CAN_NOT_CREATE_ENTITY'),
      HttpStatus.CONFLICT,
      { entityName, fieldName, fieldValue },
      errorCode,
      rootCause,
    );
  }
}
