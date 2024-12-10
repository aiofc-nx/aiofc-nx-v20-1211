import { applyDecorators } from '@nestjs/common';
import { Type } from 'class-transformer';
import {
  ValidateNested,
  IsObject,
  ValidationOptions,
  IsOptional,
} from 'class-validator';
/**
 * 嵌套属性验证相关接口和装饰器定义
 */

/**
 * 嵌套属性验证选项接口
 *
 * @description
 * 定义了嵌套属性验证所需的配置选项:
 * 1. required - 是否必需,默认为true
 * 2. validationOptions - class-validator的验证选项
 * 3. classType - 嵌套对象的类型构造函数
 */
interface ValidateNestedPropertyOptions<T> {
  required?: boolean;
  validationOptions?: ValidationOptions;
  classType: new () => T;
}

/**
 * 嵌套属性验证装饰器
 *
 * @description
 * 用于验证嵌套的对象属性:
 * 1. 使用 ValidateNested 验证嵌套对象
 * 2. 使用 Type 指定嵌套对象的类型
 * 3. 根据 required 选项决定是否:
 *    - 使用 IsObject 验证必需的对象属性
 *    - 使用 IsOptional 标记为可选属性
 *
 * @param options - 验证选项配置
 * @returns 组合后的装饰器
 *
 * @example
 * class Parent {
 *   @ValidateNestedProperty({
 *     classType: Child,
 *     required: true
 *   })
 *   child: Child;
 * }
 */
export const ValidateNestedProperty = <T>({
  required = true,
  validationOptions = {},
  classType,
}: ValidateNestedPropertyOptions<T>) => {
  const decorators = [ValidateNested(validationOptions), Type(() => classType)];

  if (required) {
    decorators.push(IsObject(validationOptions));
  } else {
    decorators.push(IsOptional(validationOptions));
  }

  return applyDecorators(...decorators);
};
