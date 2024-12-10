/**
 * Never类型工具
 *
 * @description
 * 该类型用于将对象的所有属性值转换为never类型:
 * 1. 接收一个泛型参数T作为源对象类型
 * 2. 使用映射类型[K in keyof T]遍历所有属性
 * 3. 将每个属性的值类型设置为never
 *
 * @example
 * ```ts
 * interface User {
 *   id: number;
 *   name: string;
 * }
 *
 * type NeverUser = Never<User>; // { id: never; name: never; }
 * ```
 */
export type Never<T> = {
  [K in keyof T]: never;
};
