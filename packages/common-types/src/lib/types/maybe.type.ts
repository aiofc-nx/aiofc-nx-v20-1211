/**
 * Maybe类型工具
 *
 * @description
 * 该类型用于表示一个可能为undefined的值:
 * 1. 接收一个泛型参数T
 * 2. 返回T或undefined的联合类型
 *
 * @example
 * ```ts
 * type MaybeString = Maybe<string>; // string | undefined
 * type MaybeNumber = Maybe<number>; // number | undefined
 * ```
 */
export type Maybe<T> = T | undefined;


