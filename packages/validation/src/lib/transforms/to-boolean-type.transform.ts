import { Transform } from 'class-transformer';
import { applyDecorators } from '@nestjs/common';
/**
 * 布尔类型转换装饰器
 *
 * @description
 * 用于将输入值转换为布尔类型:
 * 1. 如果输入值已经是布尔类型,则直接返回
 * 2. 如果输入值是字符串,则判断是否等于 'true'
 * 3. 其他情况返回 false
 *
 * @example
 * class User {
 *   @BooleanType
 *   isActive: boolean;
 * }
 */
export const BooleanType = applyDecorators(
  Transform(({ value }) =>
    typeof value === 'boolean' ? value : value === 'true',
  ),
);
