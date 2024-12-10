import { applyDecorators } from '@nestjs/common';
import { ValidatorOptions } from 'class-validator';
import { MaxLocalized, MinLocalized } from './primitives';
import { Transform } from 'class-transformer';
import { toInteger } from '../transforms/';
import { IsIntegerLocalized } from './primitives/is-int.validator';

/**
 * 整数字符串验证选项接口
 *
 * @description
 * 定义整数字符串验证的配置选项:
 * 1. min - 最小值
 * 2. max - 最大值
 * 3. minValidationOptions - 最小值验证选项
 * 4. maxValidationOptions - 最大值验证选项
 * 5. numberValidationOptions - 数字验证选项
 */
export interface IsIntegerStringCombinedOptions {
  min?: number;
  max?: number;
  minValidationOptions?: ValidatorOptions;
  maxValidationOptions?: ValidatorOptions;
  numberValidationOptions?: ValidatorOptions;
}

/**
 * 整数字符串组合验证装饰器
 *
 * @description
 * 用于验证字符串类型但应该是整数的参数,如路径变量和查询参数:
 * 1. 验证是否为整数格式
 * 2. 转换为整数类型
 * 3. 验证最小值(如果设置了min)
 * 4. 验证最大值(如果设置了max)
 *
 * 典型用例是分页参数(页码、每页大小等)
 *
 * @param options - 验证选项,包含:
 * - min: 最小值
 * - max: 最大值
 * - minValidationOptions: 最小值验证选项
 * - maxValidationOptions: 最大值验证选项
 *
 * @returns 组合后的装饰器
 *
 * @example
 * class PaginationDto {
 *   @IsIntegerStringCombinedLocalized({
 *     min: 1,
 *     max: 100
 *   })
 *   page: number;
 * }
 */
export const IsIntegerStringCombinedLocalized = ({
  min,
  max,
  minValidationOptions = {},
  maxValidationOptions = {},
}: IsIntegerStringCombinedOptions = {}) => {
  const decorators = [
    IsIntegerLocalized(),
    Transform(toInteger),
    min ? MinLocalized(min, minValidationOptions) : undefined,
    max ? MaxLocalized(max, maxValidationOptions) : undefined,
  ].filter((v): v is PropertyDecorator => v !== undefined);

  return applyDecorators(...decorators);
};
