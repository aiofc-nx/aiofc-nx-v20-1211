import { Transform, TransformFnParams } from 'class-transformer';

/**
 * 字符串去除首尾空格的转换函数
 *
 * @description
 * 用于处理字符串类型的属性值,去除首尾空格:
 * 1. 如果输入值为 undefined 则返回 undefined
 * 2. 如果输入值为字符串,则去除首尾空格后返回
 *
 * @param params - class-transformer 的转换参数
 * @returns 处理后的字符串或 undefined
 */
export const trimTransformer = (
  params: TransformFnParams,
): string | undefined => params.value?.trim();

/**
 * 字符串去除首尾空格的装饰器
 *
 * @description
 * 用于类属性装饰器,将 trimTransformer 转换函数包装为装饰器:
 * 1. 可直接用于类属性上
 * 2. 在实例化时自动调用转换函数处理属性值
 *
 * @example
 * class User {
 *   @Trim
 *   name: string;
 * }
 */
export const Trim = Transform(trimTransformer);
