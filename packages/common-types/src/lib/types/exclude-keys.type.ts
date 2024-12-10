import { ExtractArrayMembers } from './extract-array-members.type';
/**
 * 从对象类型中排除指定的键
 *
 * @description
 * 该类型工具用于从对象类型中排除一个或多个键:
 * 1. KeysOrListOfKeys<T> - 定义了可以是单个键或键的只读数组的联合类型
 * 2. ExcludeKeys<TObject, TKeys> - 从TObject类型中排除TKeys指定的键
 *
 * @example
 * ```ts
 * interface User {
 *   id: number;
 *   name: string;
 *   age: number;
 * }
 *
 * // 排除单个键
 * type UserWithoutId = ExcludeKeys<User, 'id'>; // { name: string; age: number; }
 *
 * // 排除多个键
 * type PublicUser = ExcludeKeys<User, ['id', 'age']>; // { name: string; }
 * ```
 */

type KeysOrListOfKeys<T> = keyof T | readonly (keyof T)[];

/**
 * 从对象类型中排除指定键的类型工具
 *
 * @description
 * 该类型接收两个泛型参数:
 * - TObject: 源对象类型
 * - TKeys: 要排除的键,可以是单个键或键的只读数组
 *
 * 实现原理:
 * 1. 使用Omit工具类型从TObject中排除键
 * 2. 通过ExtractArrayMembers提取TKeys中的所有键
 * 3. 如果TKeys是单个键,ExtractArrayMembers会直接返回该键
 * 4. 如果TKeys是键数组,ExtractArrayMembers会提取所有键的联合类型
 */
export type ExcludeKeys<
  TObject,
  TKeys extends KeysOrListOfKeys<TObject>,
> = Omit<TObject, ExtractArrayMembers<TKeys>>;
