import { applyDecorators } from '@nestjs/common';
import { ValidatorOptions } from 'class-validator';
import {
  IsArrayLocalized,
  IsArrayMaxSizeLocalized,
  IsArrayMinSizeLocalized,
} from './primitives';

/**
 * 数组验证选项接口
 *
 * @description
 * 定义数组验证的配置选项:
 * 1. minLength - 数组最小长度
 * 2. maxLength - 数组最大长度
 * 3. options - class-validator 的验证选项
 */
export interface IsArrayCombinedOptions {
  minLength?: number;
  maxLength?: number;
  options?: ValidatorOptions;
}

/**
 * 数组组合验证装饰器
 *
 * @description
 * 组合多个数组相关的验证装饰器:
 * 1. IsArrayLocalized - 验证是否为数组
 * 2. IsArrayMaxSizeLocalized - 验证数组最大长度(如果设置了maxLength)
 * 3. IsArrayMinSizeLocalized - 验证数组最小长度(如果设置了minLength)
 *
 * @param options - 数组验证选项
 * @returns 组合后的装饰器
 *
 * @example
 * class User {
 *   @IsArrayCombinedLocalized({
 *     minLength: 1,
 *     maxLength: 10
 *   })
 *   roles: string[];
 * }
 */
export const IsArrayCombinedLocalized = ({
  minLength,
  maxLength,
  options = {},
}: IsArrayCombinedOptions = {}) => {
  const decorators = [
    IsArrayLocalized(options),
    maxLength ? IsArrayMaxSizeLocalized(maxLength, options) : undefined,
    minLength ? IsArrayMinSizeLocalized(minLength, options) : undefined,
  ].filter((v): v is PropertyDecorator => v !== undefined);

  return applyDecorators(...decorators);
};
