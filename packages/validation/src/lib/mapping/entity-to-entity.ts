import { plainToInstance } from 'class-transformer';
import {
  ClassConstructor,
  ClassTransformOptions,
} from 'class-transformer/types/interfaces';
/**
 * 实体映射工具函数
 *
 * @description
 * 提供了将普通对象映射为类实例的功能:
 * 1. 支持单个对象和数组的映射
 * 2. 使用 class-transformer 进行类型转换
 * 3. 可配置映射选项
 */

/**
 * 将普通对象数组映射为目标类的实例数组
 */
export function map<FROM, TO>(
  from: FROM[],
  clazz: ClassConstructor<TO>,
  options?: ClassTransformOptions,
): TO[];

/**
 * 将单个普通对象映射为目标类的实例
 */
export function map<FROM, TO>(
  from: FROM,
  clazz: ClassConstructor<TO>,
  options?: ClassTransformOptions,
): TO;

/**
 * map 函数的具体实现
 * @param from - 源对象或对象数组
 * @param clazz - 目标类构造函数
 * @param options - 映射选项
 * @returns 目标类实例或实例数组
 */
export function map<FROM, TO>(
  from: FROM | FROM[],
  clazz: ClassConstructor<TO>,
  options?: ClassTransformOptions,
): TO | TO[] {
  return plainToInstance(clazz, from, {
    ...DEFAULT_MAP_OPTIONS,
    ...options,
  });
}

/**
 * 默认的映射选项
 *
 * @property excludeExtraneousValues - 排除未在目标类中定义的属性
 * @property exposeDefaultValues - 暴露默认值
 * @property ignoreDecorators - 忽略装饰器
 * @property exposeUnsetFields - 不暴露未设置的字段
 */
export const DEFAULT_MAP_OPTIONS: ClassTransformOptions = {
  excludeExtraneousValues: true,
  exposeDefaultValues: true,
  ignoreDecorators: true,
  exposeUnsetFields: false,
};
