/**
 * 终端类型定义模块
 *
 * @description
 * 该模块定义了终端类型,用于防止在ClsStore中生成类型的嵌套属性路径:
 *
 * 1. TERMINAL_BRAND
 * - 使用Symbol创建唯一标识符
 * - 用于标记终端类型
 *
 * 2. BrandedTerminal类
 * - 包含一个私有的Symbol属性
 * - 作为终端类型的基类
 *
 * 3. Terminal类型
 * - 将输入类型T与BrandedTerminal交叉
 * - 用于标记某个类型为终端类型
 * - 防止在ClsStore中对该类型的属性进行递归遍历
 */

const TERMINAL_BRAND = Symbol();
export class BrandedTerminal {
    private [TERMINAL_BRAND]?: void;
}

/**
 * 终端类型
 * 通过与BrandedTerminal交叉,将类型标记为终端类型
 * 用于防止在ClsStore中生成该类型的嵌套属性路径
 */
export type Terminal<T> = T & BrandedTerminal;
