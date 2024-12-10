import { BrandedTerminal } from './terminal.type';

/**
 * 定义终端类型
 * 包含了所有不需要进一步递归的基本类型和内置对象类型
 */
type TerminalType =
    | string
    | number
    | bigint
    | boolean
    | null
    | undefined
    | any[]
    | Map<any, any>
    | Set<any>
    | Date
    | RegExp
    | AbortController
    | BrandedTerminal
    | ((...args: any) => any);

/**
 * 判断类型T是否为any类型
 * 如果T是any类型则返回true,否则返回false
 * 实现原理:
 * 1. unknown extends T 检查T是否是顶级类型
 * 2. [keyof T] extends [never] 检查T是否有任何属性
 * 3. 结合这两个条件判断是否为any类型
 *
 * 来源: https://stackoverflow.com/a/68633327/5290447
 */
type IsAny<T> = unknown extends T
    ? [keyof T] extends [never]
        ? false
        : true
    : false;

/**
 * 递归获取接口的所有嵌套键,使用点语法表示
 *
 * 实现说明:
 * 1. 如果T是终端类型或any类型,返回never
 * 2. 否则递归遍历T的所有属性:
 *   - 如果没有前缀,返回当前键K或递归结果
 *   - 如果有前缀,返回 "前缀.当前键" 或递归结果
 *
 * @example
 * type t = RecursiveKeyOf<{a: {b: {c: string}}> // => 'a' | 'a.b' | 'a.b.c'
 */
export type RecursiveKeyOf<
    T,
    Prefix extends string = never,
> = T extends TerminalType
    ? never
    : IsAny<T> extends true
    ? never
    : {
          [K in keyof T & string]: [Prefix] extends [never]
              ? K | RecursiveKeyOf<T[K], K>
              : `${Prefix}.${K}` | RecursiveKeyOf<T[K], `${Prefix}.${K}`>;
      }[keyof T & string];

/**
 * 使用点语法获取嵌套属性的类型
 *
 * 实现说明:
 * 1. 如果路径包含点号,递归解析:
 *   - 检查前缀是否是有效的键
 *   - 递归处理剩余路径
 * 2. 如果是单个键,直接返回对应类型
 *
 * 本质上是RecursiveKeyOf的反向操作
 *
 * @example
 * type t = DeepPropertyType<{a: {b: {c: string}}}, 'a.b.c'> // => string
 */
export type DeepPropertyType<
    T,
    P extends RecursiveKeyOf<T>,
    TT = Exclude<T, undefined>,
> = P extends `${infer Prefix}.${infer Rest}`
    ? Prefix extends keyof TT
        ? Rest extends RecursiveKeyOf<TT[Prefix]>
            ? DeepPropertyType<TT[Prefix], Rest>
            : never
        : never
    : P extends keyof TT
    ? TT[P]
    : never;
