/**
 * 预设类型枚举
 *
 * 定义了数据操作的预设类型:
 * - INSERT: 插入操作的预设类型
 * - UPDATE: 更新操作的预设类型
 * - ALL: 适用于所有操作的预设类型
 *
 * 该枚举用于:
 * 1. 标识数据操作的类型
 * 2. 控制预设值的应用场景
 * 3. 在装饰器中指定预设值的作用范围
 */
export enum PresetType {
  INSERT = 'INSERT',
  UPDATE = 'UPDATE',
  ALL = 'ALL',
}
