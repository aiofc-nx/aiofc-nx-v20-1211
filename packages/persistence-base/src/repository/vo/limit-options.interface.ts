/**
 * 分页选项接口
 *
 * 该接口定义了分页查询所需的基本参数:
 * 1. limit: 每页返回的最大记录数
 *    - 用于限制单次查询返回的数据量
 *    - 避免一次性返回过多数据导致性能问题
 *
 * 2. offset: 数据偏移量
 *    - 表示从第几条记录开始返回数据
 *    - 用于实现分页功能,配合limit使用
 *    - offset = (pageNumber - 1) * limit
 *
 * 使用场景:
 * - 分页查询数据
 * - 限制查询结果集大小
 * - 实现数据分批加载
 */
export interface LimitOptions {
  limit: number;
  offset: number;
}
