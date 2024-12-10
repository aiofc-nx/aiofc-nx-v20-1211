/**
 * 元数据复制工具模块
 *
 * @description
 * 该模块提供了复制对象元数据的功能:
 *
 * 1. copyMethodMetadata函数
 * - 将源对象的所有元数据复制到目标对象
 * - 在装饰器中重写函数定义时保留原有元数据
 *
 * 实现说明:
 * 1. 使用Reflect.getMetadataKeys获取源对象的所有元数据键
 * 2. 遍历每个元数据键:
 *   - 使用Reflect.getMetadata获取键对应的元数据值
 *   - 使用Reflect.defineMetadata将元数据复制到目标对象
 *
 * @param from - 源对象,要复制元数据的对象
 * @param to - 目标对象,要将元数据复制到的对象
 */
export function copyMethodMetadata(from: any, to: any) {
    const metadataKeys = Reflect.getMetadataKeys(from);
    metadataKeys.map((key) => {
        const value = Reflect.getMetadata(key, from);
        Reflect.defineMetadata(key, value, to);
    });
}
