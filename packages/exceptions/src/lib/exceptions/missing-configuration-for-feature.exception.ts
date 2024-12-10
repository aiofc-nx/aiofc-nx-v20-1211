import { HttpStatus } from '@nestjs/common';
import { AbstractHttpException } from './abstract-http.exception';
import { i18nString } from '../utils/i18n';

/**
 * 缺少功能配置异常类
 *
 * 该类继承自AbstractHttpException，用于处理功能配置缺失的情况
 *
 * @class MissingConfigurationForFeatureException
 * @extends {AbstractHttpException}
 */
export class MissingConfigurationForFeatureException extends AbstractHttpException {
  /**
   * 创建一个缺少功能配置异常实例
   *
   * @param {string} featureName - 缺失配置的功能名称
   * @param {string} [errorCode] - 可选的错误代码
   * @param {unknown} [rootCause] - 可选的根本原因
   */
  constructor(featureName: string, errorCode?: string, rootCause?: unknown) {
    super(
      i18nString('exception.NOT_FOUND.TITLE'), // 异常标题，使用i18n国际化
      i18nString(
        'exception.NOT_FOUND.MISSING_CONFIGURATION_FOR_FEATURE_DETAIL', // 异常详细信息，使用i18n国际化
      ),
      HttpStatus.NOT_FOUND, // HTTP状态码设置为404 NOT_FOUND
      {
        featureName, // 传入功能名称作为额外信息
      },
      errorCode, // 可选的错误代码
      rootCause, // 可选的根本原因
    );
  }
}
