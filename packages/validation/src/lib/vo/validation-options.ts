import { HttpStatus, ValidationPipeOptions } from '@nestjs/common';
/**
 * 全局的默认验证选项设定值
 *
 * @description
 * 定义了全局验证管道的默认配置:
 * 1. transform: true - 启用自动类型转换,将请求数据转换为DTO类型
 * 2. whitelist: true - 启用白名单模式:
 *    - 只接受在DTO类中定义的属性
 *    - 自动过滤掉未在DTO中声明的属性
 *    - 通过比对请求数据与DTO类定义来实现数据清洗
 * 3. errorHttpStatusCode - 验证失败时返回400 Bad Request状态码
 *
 * @example
 * // 在 main.ts 中应用全局验证配置
 * app.useGlobalPipes(new ValidationPipe(DEFAULT_VALIDATION_OPTIONS));
 */
const DEFAULT_VALIDATION_OPTIONS: ValidationPipeOptions = {
  transform: true,
  whitelist: true,
  errorHttpStatusCode: HttpStatus.BAD_REQUEST,
};

export { DEFAULT_VALIDATION_OPTIONS };
