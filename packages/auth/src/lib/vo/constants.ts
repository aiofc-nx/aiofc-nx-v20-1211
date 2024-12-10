/**
 * 跳过认证的常量标识
 *
 * 该常量用于标记需要跳过认证的路由或方法。
 * 主要用途:
 * 1. 作为装饰器的元数据键名
 * 2. 用于标识公开API,无需进行身份验证
 * 3. 在认证守卫中判断是否需要进行认证检查
 */
export const SKIP_AUTH = 'skipAuth';
