import { Transform, TransformFnParams } from 'class-transformer';

/**
 * 字符串转小写并去除首尾空格的转换函数
 *
 * @description
 * 用于处理字符串或字符串数组类型的属性值:
 * 1. 如果输入值为数组,则对数组中每个元素进行处理
 * 2. 对每个字符串元素:
 *    - 转换为小写
 *    - 去除首尾空格
 * 3. 如果输入值为单个字符串,直接处理并返回
 * 4. 如果输入值为 undefined 则返回 undefined
 *
 * @param params - class-transformer 的转换参数
 * @returns 处理后的字符串、字符串数组或 undefined
 */
export const trimAndLowercaseTransformer = (
  params: TransformFnParams,
): string | string[] | undefined => {
  if (Array.isArray(params.value)) {
    return params.value.map((item) => item.toLowerCase().trim());
  }

  return params.value?.toLowerCase().trim();
};

/**
 * 字符串转小写并去除首尾空格的装饰器
 *
 * @description
 * 用于类属性装饰器,将 trimAndLowercaseTransformer 转换函数包装为装饰器:
 * 1. 可直接用于类属性上
 * 2. 在实例化时自动调用转换函数处理属性值
 *
 * @example
 * class User {
 *   @TrimAndLowercase
 *   email: string;
 * }
 */
export const TrimAndLowercase = Transform(trimAndLowercaseTransformer);
