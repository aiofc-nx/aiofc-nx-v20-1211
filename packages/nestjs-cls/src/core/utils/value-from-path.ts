import {
    RecursiveKeyOf,
    DeepPropertyType,
} from '../types/recursive-key-of.type';

/**
 * 路径值获取和设置工具模块
 *
 * @description
 * 该模块提供了两个主要函数:
 *
 * 1. getValueFromPath - 根据路径获取对象中的值
 * - 接收对象和点分隔的路径字符串
 * - 递归遍历路径获取嵌套值
 * - 返回路径对应的值或undefined
 *
 * 2. setValueFromPath - 根据路径设置对象中的值
 * - 接收对象、路径和要设置的值
 * - 递归创建路径中不存在的对象
 * - 在路径终点设置值
 * - 返回修改后的对象
 */

/**
 * 根据路径获取对象中的值
 *
 * @description
 * 实现说明:
 * 1. 接收泛型参数:
 *   - T: 源对象类型
 *   - TP: 继承自RecursiveKeyOf<T>的字符串路径类型
 *
 * 2. 参数:
 *   - obj: 源对象
 *   - path: 点分隔的路径字符串,如 'a.b.c'
 *
 * 3. 实现步骤:
 *   - 使用split('.')将路径分割为路径段数组
 *   - 使用reduce遍历路径段:
 *     - acc表示当前访问的对象
 *     - curr表示当前路径段
 *     - acc?.[curr]获取当前路径段对应的值
 *   - 返回最终获取的值,类型为DeepPropertyType<T, TP>
 *
 * @example
 * const obj = { a: { b: { c: 1 } } };
 * getValueFromPath(obj, 'a.b.c') // => 1
 */
export function getValueFromPath<T, TP extends RecursiveKeyOf<T> & string>(
    obj: T,
    path: TP,
): DeepPropertyType<T, TP> {
    const pathSegments = path.split('.');
    return pathSegments.reduce(
        (acc, curr) => acc?.[curr],
        obj,
    ) as DeepPropertyType<T, TP>;
}

/**
 * 根据路径设置对象中的值
 *
 * @description
 * 实现说明:
 * 1. 泛型参数:
 *   - T: 源对象类型
 *   - TP: 继承自RecursiveKeyOf<T>的字符串路径类型
 *   - V: 要设置的值的类型,必须匹配路径对应的类型
 *
 * 2. 参数:
 *   - obj: 源对象
 *   - path: 点分隔的路径字符串,如 'a.b.c'
 *   - value: 要设置的值
 *
 * 3. 实现步骤:
 *   - 使用split('.')将路径分割为路径段数组
 *   - 使用slice(0, -1)获取除最后一段外的路径
 *   - 使用reduce遍历路径段:
 *     - 如果当前路径段不存在,则创建空对象
 *     - 返回当前路径段对应的对象,用于下一次迭代
 *   - 在最终对象上设置最后一个路径段对应的值
 *   - 返回修改后的源对象
 *
 * @example
 * const obj = {};
 * setValueFromPath(obj, 'a.b.c', 1) // => { a: { b: { c: 1 } } }
 */
export function setValueFromPath<
    T,
    TP extends RecursiveKeyOf<T> & string,
    V extends DeepPropertyType<T, TP>,
>(obj: T, path: TP, value: V) {
    const pathSegments = path.split('.');
    const leaf = pathSegments.slice(0, -1).reduce((acc, curr) => {
        acc[curr] ?? (acc[curr] = {});
        return acc[curr];
    }, obj ?? {});
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    leaf[pathSegments.at(-1)!] = value;
    return obj;
}
