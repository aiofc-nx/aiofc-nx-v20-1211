import { I18nContext, I18nService } from '@aiofc/i18n';
import { ErrorResponse } from '../vo/error-response.dto';
/**
 * 抽象HTTP异常基类
 *
 * @description
 * 该类是所有HTTP异常的基类,提供了以下功能:
 * 1. 统一的异常构造函数,包含标题、详情、状态码等基本信息
 * 2. 支持附加数据和错误代码
 * 3. 提供转换为标准错误响应的方法
 * 4. 支持国际化处理
 *
 * @template ADDITIONAL_DATA - 附加数据类型,默认为普通对象
 */
export class AbstractHttpException<ADDITIONAL_DATA extends object = object> {
  /**
   * 构造函数
   * @param title - 错误标题
   * @param detail - 错误详情
   * @param status - HTTP状态码
   * @param data - 附加数据
   * @param errorCode - 错误代码
   * @param rootCause - 根本原因
   */
  constructor(
    public title: string,
    public detail: string,
    public status: number,
    public data?: ADDITIONAL_DATA | ADDITIONAL_DATA[],
    public errorCode?: string,
    public rootCause?: unknown,
  ) {}

  /**
   * 转换为标准错误响应
   *
   * @description
   * 将异常信息转换为标准的错误响应格式,支持国际化:
   * 1. 翻译错误标题和详情
   * 2. 添加请求ID用于追踪
   * 3. 包含错误代码等额外信息
   *
   * @param requestId - 请求ID
   * @param i18nService - 国际化服务
   * @returns 标准错误响应对象
   */
  toErrorResponse(
    requestId: string,
    i18nService?: I18nService | I18nContext,
  ): ErrorResponse {
    const title = i18nService?.translate(this.title);
    const detail = i18nService?.translate(this.detail, {
      args: this.data,
    });

    return {
      // todo  implement link to the docs, get from config
      type: 'todo implement link to the docs, get from config',
      title: title?.toString() ?? /* istanbul ignore next */ this.title,
      detail: detail?.toString() ?? /* istanbul ignore next */ this.detail,
      status: this.status,
      instance: requestId,
      errorCode: this.errorCode,
    } satisfies ErrorResponse;
  }

  /**
   * 获取预设的响应头
   *
   * @description
   * 用于获取异常相关的HTTP响应头
   * 默认返回空对象,子类可以覆盖此方法添加自定义响应头
   *
   * @returns 响应头键值对
   */
  getPresetHeadersValues(): Record<string, string> {
    return {};
  }
}
