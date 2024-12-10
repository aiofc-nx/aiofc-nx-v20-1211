/**
 * 内容版本头部字段名称
 *
 * @description
 * 定义了用于标识内容版本的HTTP头部字段名称。
 * 该头部字段用于在HTTP请求/响应中传递内容的版本信息,
 * 可用于实现内容版本控制、缓存验证等功能。
 *
 * @example
 * // HTTP响应头部示例
 * X-Content-Version: v1.2.3
 */
export const CONTENT_VERSION_HEADER = 'X-Content-Version';
