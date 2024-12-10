import { Transform } from 'class-transformer';
import { applyDecorators } from '@nestjs/common';
import { toInteger } from './to-integer.trasformer';

/**
 * 整数类型转换装饰器
 *
 * @description
 * 用于将输入值转换为整数类型:
 * 1. 使用 class-transformer 的 Transform 装饰器
 * 2. 调用 toInteger 转换函数进行具体的转换逻辑
 * 3. 通过 applyDecorators 组合装饰器
 *
 * @example
 * class User {
 *   @IntegerType
 *   age: number;
 * }
 */
export const IntegerType = applyDecorators(Transform(toInteger));
