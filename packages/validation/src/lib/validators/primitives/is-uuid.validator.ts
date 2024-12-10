import { IS_UUID, isUUID, IsUUID, ValidationOptions } from 'class-validator';
// import { UUIDVersion } from 'class-validator/types/decorator/string/IsUUID';
import { IValidatorDefinition } from '../dynamic';
import { i18n, i18nString } from '../../utils';
import { UUIDVersion } from 'validator';

/**
 * UUID 验证相关常量和装饰器定义
 */

/** 验证失败时的错误消息 key */
const MESSAGE = 'validation.UUID_V4';

/**
 * UUID 验证装饰器
 *
 * @description
 * 用于验证属性值是否为有效的 UUID:
 * 1. 使用 class-validator 的 IsUUID 进行验证
 * 2. 支持指定 UUID 版本(默认为 v4)和验证选项
 * 3. 使用本地化的错误消息
 *
 * @param opt - UUID 版本,默认为 4
 * @param validationOptions - class-validator 的验证选项
 * @returns 属性装饰器
 *
 * @example
 * class Form {
 *   @IsUUIDLocalized()
 *   id: string;
 * }
 */
export const IsUUIDLocalized = (
  opt: UUIDVersion = 4,
  validationOptions: ValidationOptions = {},
) =>
  IsUUID(opt, {
    message: i18n(MESSAGE),
    ...validationOptions,
  });

/**
 * UUID 验证器定义
 *
 * @description
 * 定义了 UUID 验证器的核心配置:
 * 1. name - 验证器名称,使用 class-validator 内置的 IS_UUID
 * 2. validator - 验证函数,使用 class-validator 的 isUUID
 * 3. defaultValidationMessage - 默认错误消息的 i18n key
 * 4. decorator - 使用上面定义的 IsUUIDLocalized 装饰器
 */
export const IsUUIDValidatorDefinition = {
  name: IS_UUID,
  validator: isUUID,
  defaultValidationMessage: i18nString(MESSAGE),
  decorator: IsUUIDLocalized,
} satisfies IValidatorDefinition<string, UUIDVersion>;
