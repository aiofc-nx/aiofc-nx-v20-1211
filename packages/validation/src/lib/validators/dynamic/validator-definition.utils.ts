import { IValidatorDefinition } from './validator-definition.interface';
import {
  I18nValidationError,
  Path,
  i18nValidationMessage,
} from '@aiofc/i18n';
import { TransformFnParams } from 'class-transformer';
import { GeneralBadRequestException } from '@aiofc/exceptions';
import { I18nTranslations } from '../../generated/i18n.generated';

/**
 * 提取 TransformFnParams 中的必要属性
 * 排除了 obj、type 和 options 这些不常用的属性
 */
type TransformFnParamsEssentials = Omit<
  TransformFnParams,
  'obj' | 'type' | 'options'
>;

/**
 * 将验证器定义转换为 i18n 错误对象
 *
 * @param validatorDefinition - 验证器定义对象
 * @param params - 转换函数的必要参数
 * @param constraint - 验证约束条件
 * @param overrideDefaultMessage - 覆盖默认错误消息
 * @param args - 额外的参数
 * @returns I18n 错误对象
 */
function validationDefinitionToI18NError<T, E>(
  validatorDefinition: IValidatorDefinition<T, E>,
  params: TransformFnParamsEssentials,
  constraint?: E,
  overrideDefaultMessage?: string,
  args?: unknown,
): I18nValidationError {
  // 将消息格式化为如下形式:
  // "common.validation.MAX_LENGTH|{ "constraints": [ "10" ], "args": {} }"
  const validationMessageFormatted = i18nValidationMessage(
    overrideDefaultMessage ?? validatorDefinition.defaultValidationMessage,
    args,
  )({
    // 这些参数在 i18nValidationMessage 函数中实际并未使用
    property: params.key,
    value: params.value,
    constraints: constraint === undefined ? [] : [constraint],
    targetName: '',
    object: {},
  });

  return {
    property: params.key,
    value: params.value,
    constraints: {
      [validatorDefinition.name]: validationMessageFormatted,
    },
  } satisfies I18nValidationError;
}

/**
 * 验证值并在无效时抛出异常
 *
 * @param validatorDefinition - 验证器定义对象
 * @param fieldName - 字段名称
 * @param value - 需要验证的值
 * @param constraint - 验证约束条件
 * @param overrideDefaultMessage - 覆盖默认错误消息
 * @param args - 额外的参数
 * @throws {GeneralBadRequestException} 当验证失败时抛出
 */
export function validateAndThrow<T, E>(
  validatorDefinition: IValidatorDefinition<T, E>,
  fieldName: string,
  value: T,
  constraint?: E,
  overrideDefaultMessage?: string,
  args?: unknown,
) {
  const isValid = validatorDefinition.validator(value, constraint as E);

  if (!isValid) {
    throwValidationException(
      validatorDefinition,
      {
        key: fieldName,
        value,
      },
      constraint,
      overrideDefaultMessage,
      args,
    );
  }
}

/**
 * 验证值并返回错误对象(如果无效)
 *
 * @example
 * const exampleValidatorDefinition = {
 *   name: 'exampleValidator',
 *   defaultValidationMessage: 'Value is invalid',
 *   validator: (value: string, constraint: number) => value.length <= constraint,
 *   decorator: (options: number, validationOptions?: ValidationOptions) => {
 *     // ...decorator implementation...
 *     return () => {};
 *   },
 * };
 *
 * const fieldName = 'exampleField';
 * const value = 'exampleValue';
 * const constraint = 10;
 * const overrideDefaultMessage = 'Value exceeds maximum length';
 * const args = {};
 *
 * const error = validateAndReturnError(
 *   exampleValidatorDefinition,
 *   fieldName,
 *   value,
 *   constraint,
 *   overrideDefaultMessage,
 *   args,
 * );
 * console.log(error);
 *
 * @param validatorDefinition - 验证器定义对象
 * @param fieldName - 字段名称
 * @param value - 需要验证的值
 * @param constraint - 验证约束条件
 * @param overrideDefaultMessage - 覆盖默认错误消息
 * @param args - 额外的参数
 * @returns 验证错误对象,如果验证通过则返回 undefined
 */
export function validateAndReturnError<T, E>(
  validatorDefinition: IValidatorDefinition<T, E>,
  fieldName: string,
  value: T,
  constraint?: E,
  overrideDefaultMessage?: Path<I18nTranslations>,
  args?: unknown,
): I18nValidationError | undefined {
  const isValid = validatorDefinition.validator(value, constraint as E);

  return isValid
    ? undefined
    : validationDefinitionToI18NError(
        validatorDefinition,
        {
          key: fieldName,
          value,
        },
        constraint,
        overrideDefaultMessage,
        args,
      );
}

/**
 * 抛出验证异常
 *
 * @param validatorDefinition - 验证器定义对象
 * @param params - 转换函数的必要参数
 * @param constraint - 验证约束条件
 * @param overrideDefaultMessage - 覆盖默认错误消息
 * @param args - 额外的参数
 * @throws {GeneralBadRequestException} 总是抛出验证错误
 */
function throwValidationException<T, E>(
  validatorDefinition: IValidatorDefinition<T, E>,
  params: TransformFnParamsEssentials,
  constraint?: E,
  overrideDefaultMessage?: string,
  args?: unknown,
) {
  const validationError = validationDefinitionToI18NError(
    validatorDefinition,
    params,
    constraint,
    overrideDefaultMessage,
    args,
  );

  throw new GeneralBadRequestException(validationError);
}
