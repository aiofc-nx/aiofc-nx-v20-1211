/**
 * 循环依赖异常类
 *
 * @description
 * 当检测到循环依赖关系时抛出此异常。
 * 主要用于以下场景:
 * 1. 实体之间存在双向关系但未使用forwardRef()装饰
 * 2. 使用了barrel文件(index.ts导出)导致的意外循环依赖
 *
 * @extends Error
 */
export class CircularDependencyException extends Error {
  /**
   * 创建循环依赖异常实例
   *
   * @param context 可选的上下文信息,用于指明循环依赖发生的位置
   */
  constructor(context?: string) {
    const ctx = context ? ` inside ${context}` : ``;
    super(
      `A circular dependency has been detected${ctx}. Please, make sure that each side of a bidirectional relationships are decorated with "forwardRef()". Also, try to eliminate barrel files because they can lead to an unexpected behavior too.`,
    );
  }
}
