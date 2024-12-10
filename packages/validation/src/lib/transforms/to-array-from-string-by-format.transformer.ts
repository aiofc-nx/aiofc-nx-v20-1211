import { TransformFnParams } from 'class-transformer';
import { ClassConstructor } from 'class-transformer/types/interfaces';
import { validateAndThrow } from '../validators/dynamic';
import { IsEnumValidatorDefinition } from '../validators';
import { map } from '../mapping';
/**
 * 将字符串格式的数据转换为对象数组
 *
 * @description
 * 此函数用于将特定格式的字符串转换为对象数组:
 * 1. 字符串格式为: "key1:value1,key2:value2"
 * 2. 对象之间使用逗号分隔
 * 3. 键值对使用冒号分隔
 * 4. 会对每个键进行枚举值验证
 * 5. 最终将转换后的对象映射为指定类的实例
 *
 * @param params - class-transformer 的转换参数
 * @param keys - 对象的键数组
 * @param constr - 目标类构造函数
 * @param keysValues - 键的有效值数组(用于枚举验证)
 * @param objectsSeparator - 对象之间的分隔符,默认为逗号
 * @param valuesSeparator - 键值对之间的分隔符,默认为冒号
 * @returns 转换后的对象数组
 */
export const toObjectsArrayFromString = <T>(
  params: TransformFnParams,
  keys: Array<keyof T>,
  constr: ClassConstructor<T>,
  keysValues: string[],
  objectsSeparator = ',',
  valuesSeparator = ':',
) => {
  const value = params.value;

  /* istanbul ignore next */
  if (value === undefined) {
    /**
     * 由于此函数用于处理查询参数,且只有在有查询参数时才会调用
     * 所以实际上不会出现 undefined 的情况
     */
    /* istanbul ignore next */
    return;
  }

  /* istanbul ignore next */
  if (typeof value !== 'string') {
    /**
     * 由于此函数用于处理查询参数,输入必定是字符串
     * 所以实际上不会出现非字符串的情况
     */
    return {};
  }

  // 将字符串按对象分隔符拆分,并处理每个对象字符串
  return value.split(objectsSeparator).map((v) => {
    // 将对象字符串按键值对分隔符拆分
    const values = v.split(valuesSeparator);

    // 将拆分的值数组转换为对象
    const record = values.reduce(
      (acc, curr, index) => {
        const keyName = keys[index];

        // 验证键名是否在允许的枚举值范围内
        validateAndThrow(
          IsEnumValidatorDefinition,
          params.key,
          keyName?.toString(),
          keysValues,
        );

        // 将当前值添加到累加器对象中
        acc[keyName] = curr;
        return acc;
      },
      // 使用 unknown 类型以便未来扩展转换功能
      {} as Record<keyof T, unknown>,
    );

    // 将记录对象映射为目标类实例
    return map(record, constr);
  });
};
