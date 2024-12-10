import { ClassConstructor } from 'class-transformer';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
/**
 * 属性值匹配验证相关装饰器和验证器定义
 */

/**
 * 属性值匹配验证装饰器
 *
 * @description
 * 用于验证一个属性的值是否与另一个属性的值相匹配:
 * 1. 接收目标类型和属性选择器函数作为参数
 * 2. 注册一个自定义验证装饰器
 * 3. 使用 MatchConstraint 验证器进行验证
 *
 * @param type - 目标类的构造函数类型
 * @param property - 用于选择要匹配的属性值的函数
 * @param validationOptions - class-validator 的验证选项
 * @returns 属性装饰器
 *
 * @example
 * class Form {
 *   password: string;
 *
 *   @MatchesWithProperty(Form, f => f.password)
 *   confirmPassword: string;
 * }
 */
export const MatchesWithProperty = <T>(
  type: ClassConstructor<T>,
  property: (o: T) => unknown,
  validationOptions?: ValidationOptions,
) => {
  return (object: any, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [property],
      validator: MatchConstraint,
    });
  };
};

/**
 * 属性值匹配验证器
 *
 * @description
 * 实现属性值匹配的验证逻辑:
 * 1. 从验证参数中获取属性选择器函数
 * 2. 执行选择器函数获取目标属性值
 * 3. 比较当前值与目标属性值是否相等
 */
@ValidatorConstraint({ name: 'match' })
export class MatchConstraint implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments) {
    const [fn] = args.constraints;
    return fn(args.object) === value;
  }
}
