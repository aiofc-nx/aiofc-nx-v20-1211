/**
 * 条件类型工具模块
 *
 * @description
 * 该模块提供了一系列条件类型工具:
 *
 * 1. TypeIfType<C, E, T, T2>
 * - 如果类型C继承自类型E,返回类型T
 * - 否则返回类型T2
 *
 * 2. TypeIfSymbol<C, T, T2>
 * - 如果类型C是symbol类型,返回类型T
 * - 否则返回类型T2
 *
 * 3. TypeIfUndefined<C, T, T2>
 * - 如果类型C是undefined类型,返回类型T
 * - 否则返回类型T2
 *
 * 4. TypeIfNever<C, T>
 * - 如果类型C是never类型,返回类型T
 * - 否则返回类型C本身
 *
 * 5. AnyIfNever<C>
 * - 如果类型C是never类型,返回any类型
 * - 否则返回类型C本身
 *
 * 6. StringIfNever<C>
 * - 如果类型C是never类型,返回string类型
 * - 否则返回类型C本身
 */

export type TypeIfType<C, E, T, T2> = [C] extends [E] ? T : T2;

export type TypeIfSymbol<C, T, T2> = [C] extends [symbol] ? T : T2;

export type TypeIfUndefined<C, T, T2> = [C] extends [undefined] ? T : T2;

export type TypeIfNever<C, T> = [C] extends [never] ? T : C;

export type AnyIfNever<C> = TypeIfNever<C, any>;

export type StringIfNever<C> = TypeIfNever<C, string>;
