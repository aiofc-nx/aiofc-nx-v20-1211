import { ValidationOptions } from 'class-validator';

/**
 * 验证器定义接口
 * @template VALUE_TYPE - 需要验证的值的类型
 * @template VALIDATION_OPTIONS - 验证选项的类型
 */
export interface IValidatorDefinition<VALUE_TYPE, VALIDATION_OPTIONS> {
  /** 验证器名称 */
  name: string;

  /** 默认的验证失败消息 */
  defaultValidationMessage: string;

  /**
   * 验证函数
   * @param v - 需要验证的值
   * @param options - 验证选项
   * @returns 返回验证是否通过
   */
  validator: (v: VALUE_TYPE, options: VALIDATION_OPTIONS) => boolean;

  /**
   * 装饰器工厂函数
   * @param options - 验证选项
   * @param validationOptions - class-validator的验证选项
   * @returns 返回属性装饰器
   */
  decorator: (
    options: VALIDATION_OPTIONS,
    validationOptions?: ValidationOptions,
  ) => PropertyDecorator;
}
