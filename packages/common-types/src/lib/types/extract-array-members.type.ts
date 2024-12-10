/**
 * 从数组或单个值中提取成员类型的工具类型
 *
 * @description
 * 该类型有两个主要功能:
 * 1. 如果输入是只读数组类型,则提取数组成员的类型
 * 2. 如果输入是基本类型(string|number|symbol),则返回该类型本身
 * 3. 其他情况返回never类型
 *
 * @example
 * ```ts
 * // 从数组提取成员类型
 * type A = ExtractArrayMembers<readonly string[]>; // string
 *
 * // 基本类型直接返回
 * type B = ExtractArrayMembers<string>; // string
 *
 * // 其他类型返回never
 * type C = ExtractArrayMembers<object>; // never
 * ```
 */
export type ExtractArrayMembers<T> = T extends readonly (infer MemberType)[]
  ? MemberType
  : T extends string | number | symbol
  ? T
  : never;
