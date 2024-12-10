import { ArgumentsHost, ExecutionContext, Logger } from '@nestjs/common';
/**
 * 创建一个日志记录器实例,用于记录 I18nService 相关的日志
 */
const logger = new Logger('I18nService');

/**
 * 获取上下文对象的工具函数
 *
 * @description
 * 根据不同的上下文类型返回相应的上下文对象:
 * - http: 返回 HTTP 请求对象
 * - graphql: 返回 GraphQL 上下文对象
 * - rpc: 返回 RPC 上下文对象
 * - rmq: 返回 RabbitMQ 上下文对象
 *
 * @param context ExecutionContext 或 ArgumentsHost 实例
 * @returns 对应类型的上下文对象,如果上下文不存在或类型不支持则返回 undefined
 */
export function getContextObject(
  context?: ExecutionContext | ArgumentsHost,
): any {
  // 如果上下文不存在,记录警告并返回 undefined
  if (!context) {
    logger.warn('The context is undefined');
    return undefined;
  }
  // 获取上下文类型,如果无法获取则默认为 'undefined'
  const contextType = context?.getType<string>() ?? 'undefined';

  switch (contextType) {
    case 'http': {
      // 处理 HTTP 请求上下文
      return context.switchToHttp().getRequest();
    }
    case 'graphql': {
      // 处理 GraphQL 上下文,返回第三个参数作为上下文
      return context.getArgs()[2];
    }
    case 'rpc': {
      // 处理 RPC 调用上下文
      return context.switchToRpc().getContext();
    }
    case 'rmq': {
      // 处理 RabbitMQ 消息上下文,返回第二个参数
      return context.getArgs()[1];
    }
    default: {
      // 记录不支持的上下文类型
      logger.warn(`context type: ${contextType} not supported`);
    }
  }
}
