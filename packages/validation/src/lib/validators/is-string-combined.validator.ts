import { applyDecorators } from '@nestjs/common';
import { ValidatorOptions } from 'class-validator';
import { IsNotEmptyLocalized, IsStringLocalized } from './primitives';
import { MaxLengthLocalized } from './primitives/is-max-length.validator';
import { MinLengthLocalized } from './primitives/is-min-length.validator';

/**
 * 字符串组合验证选项接口
 * 定义了一组用于字符串验证的配置选项
 */
export interface IsStringCombinedOptions {
  /** 最小长度限制 */
  minLength?: number;
  /** 最大长度限制 */
  maxLength?: number;
  /** 是否不能为空,默认为true */
  notEmpty?: boolean;
  /** 非空验证的选项配置 */
  isNotEmptyValidationOptions?: ValidatorOptions;
  /** 字符串验证的选项配置 */
  stringValidationOptions?: ValidatorOptions;
  /** 最小长度验证的选项配置 */
  minLengthValidationOptions?: ValidatorOptions;
  /** 最大长度验证的选项配置 */
  maxLengthValidationOptions?: ValidatorOptions;
}

/**
 * 字符串组合验证装饰器
 * 将多个字符串相关的验证装饰器组合在一起
 *
 * @param options - 验证选项配置
 * @returns 组合后的装饰器
 */
export const IsStringCombinedLocalized = ({
  minLength,
  maxLength,
  notEmpty = true,
  stringValidationOptions = {},
  isNotEmptyValidationOptions = {},
  minLengthValidationOptions = {},
  maxLengthValidationOptions = {},
}: IsStringCombinedOptions = {}) => {
  // 创建装饰器数组,过滤掉未定义的装饰器
  const decorators = [
    // 字符串类型验证
    IsStringLocalized(stringValidationOptions),
    // 非空验证(可选)
    notEmpty ? IsNotEmptyLocalized(isNotEmptyValidationOptions) : undefined,
    // 最大长度验证(可选)
    maxLength
      ? MaxLengthLocalized(maxLength, maxLengthValidationOptions)
      : undefined,
    // 最小长度验证(可选)
    minLength
      ? MinLengthLocalized(minLength, minLengthValidationOptions)
      : undefined,
  ].filter((v): v is PropertyDecorator => v !== undefined);

  // 应用所有装饰器
  return applyDecorators(...decorators);
};
