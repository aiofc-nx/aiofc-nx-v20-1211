import { IS_ENUM, IsEnum, isEnum, ValidationOptions } from 'class-validator';
import { applyDecorators } from '@nestjs/common';
import { IValidatorDefinition } from '../dynamic';
import { i18n } from '../../utils';

/**
 * 枚举验证装饰器
 *
 * @description
 * 用于验证属性值是否为指定枚举类型的有效值:
 * 1. 支持传入枚举对象或字符串数组作为有效值集合
 * 2. 使用本地化的错误消息
 * 3. 可自定义验证选项
 *
 * @param enumType - 枚举类型对象或字符串数组
 * @param validationOptions - class-validator 的验证选项
 * @returns 属性装饰器
 *
 * @example
 * enum UserRole {
 *   ADMIN = 'admin',
 *   USER = 'user'
 * }
 *
 * class User {
 *   @IsStringEnumLocalized(UserRole)
 *   role: UserRole;
 * }
 */
export const IsStringEnumLocalized = (
  enumType: object | string[],
  validationOptions: ValidationOptions = {},
) => {
  return applyDecorators(
    IsEnum(enumType, {
      message: i18n('validation.STRING_ENUM'),
      ...validationOptions,
    }),
  );
};

/**
 * 枚举验证器定义
 *
 * @description
 * 定义了枚举验证器的核心配置:
 * 1. name - 验证器名称,使用 class-validator 内置的 IS_ENUM
 * 2. validator - 验证函数,使用 class-validator 的 isEnum
 * 3. defaultValidationMessage - 默认错误消息的 i18n key
 * 4. decorator - 使用上面定义的 IsStringEnumLocalized 装饰器
 */
export const IsEnumValidatorDefinition = {
  name: IS_ENUM,
  validator: isEnum,
  defaultValidationMessage: 'validation.STRING_ENUM',
  decorator: IsStringEnumLocalized,
} satisfies IValidatorDefinition<unknown, object>;
