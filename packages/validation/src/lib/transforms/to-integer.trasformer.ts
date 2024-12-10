import { TransformFnParams } from 'class-transformer';

/**
 * 整数转换函数
 *
 * @description
 * 用于将输入值转换为整数:
 * 1. 处理 null/undefined 值,直接返回原值
 * 2. 如果输入为数字类型,先转为字符串
 * 3. 使用正则表达式验证是否为有效的整数格式:
 *    - 可以包含负号
 *    - 不允许前导零
 *    - 只能包含数字
 * 4. 验证通过则转换为整数并返回,否则返回 undefined
 *
 * @param params - class-transformer 的转换参数
 * @returns 转换后的整数或 undefined
 */
export const toInteger = (params: TransformFnParams): number | undefined => {
  let value = params.value;

  /* istanbul ignore next */
  if (value === null || value === undefined) {
    return value;
  }

  // 如果是数字类型,转换为字符串以统一处理
  if (typeof value === 'number') {
    value = value.toString();
  }

  // 定义整数格式的正则约束
  const constraint = /^-?(?!0\d)\d+$/;

  // 验证是否符合整数格式
  if (!constraint.test(value.toString())) {
    return;
  }

  // 转换为整数并返回
  return Number.parseInt(value, 10);
};
