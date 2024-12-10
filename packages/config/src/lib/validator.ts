import { applyDecorators } from '@nestjs/common';
import { Type } from 'class-transformer';
import {
  ValidateNested,
  IsObject,
  ValidationOptions,
  IsOptional,
} from 'class-validator';
/**
 * 嵌套属性验证选项接口
 *
 * @description
 * 定义了用于验证嵌套属性的选项:
 * - required: 是否必需,默认为 true
 * - validationOptions: class-validator 的验证选项
 * - classType: 嵌套属性的类型构造函数
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
 * 用于验证配置类中的嵌套属性:
 * - 使用 ValidateNested 验证嵌套对象
 * - 使用 Type 指定属性类型
 * - 根据 required 选项添加 IsObject 或 IsOptional 验证
 *
 * @example
 * export default class RootConfig {
 *   @ValidateNestedProperty({ classType: AppConfig })
 *   public readonly app!: AppConfig;
 * }
 */
export const ValidateNestedProperty = <T>({
  required = true,
  validationOptions = {},
  classType,
}: ValidateNestedPropertyOptions<T>) => {
  /*
   * 创建装饰器数组:
   * 1. ValidateNested - 验证嵌套对象
   * 2. Type - 指定属性类型,用于对象转换
   */
  const decorators = [ValidateNested(validationOptions), Type(() => classType)];

  /*
   * 根据 required 选项添加额外验证:
   * - true: 添加 IsObject 验证,确保值为对象
   * - false: 添加 IsOptional 验证,允许属性为可选
   */
  if (required) {
    decorators.push(IsObject(validationOptions));
  } else {
    decorators.push(IsOptional(validationOptions));
  }

  // 使用 applyDecorators 组合所有装饰器
  return applyDecorators(...decorators);
};
