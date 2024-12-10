import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { useContainer } from 'class-validator';
import { FastifyInstance } from 'fastify';
import { buildFastifyAdapter, initialize } from './setup';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppConfig } from '../config/app.config';
import { Logger } from '@aiofc/logger';

export async function fastifyBootstrap(module: any) {
  /*
  初始化事务上下文，
  调用 initializeTransactionalContext 必须在初始化任何应用程序上下文之前发生！
  https://www.npmjs.com/package/typeorm-transactional#usage
  根据官方的推荐，我们应该在在这里调用 initializeTransactionalContext() 方法，
  以确保在应用程序启动时正确初始化事务上下文。
  考虑到有些应用不会使用数据库，或者typeorm，所以我们把它移到Nest应用的main.ts中。
*/
  // initializeTransactionalContext();

  const app = await NestFactory.create<NestFastifyApplication>(
    module,
    buildFastifyAdapter(),
    // 设置为 true 时，日志消息将被暂时存储（缓冲）而不是立即输出。
    {
      bufferLogs: true,
      // TODO: 在express 设置为 false 时，将关闭请求的日志记录。但是，在fastify不起作用，我也不知道为什么
      // logger: false
    }
  );
  useContainer(app.select(module), { fallbackOnErrors: true });

  const config = app.get(AppConfig);
  const logger = app.get(Logger);
  // 直接访问和操作 Fastify 实例，利用 Fastify 提供的各种功能和插件来扩展和定制你的 NestJS 应用程序。
  const fastifyInstance: FastifyInstance = app.getHttpAdapter().getInstance();
  // 从依赖注入容器中获取了一个 HttpAdapterHost 实例，确保在需要时能够访问和操作底层的 HTTP 服务器实例。
  const httpAdapterHost = app.get(HttpAdapterHost);

  const fastifyHttpServer = await initialize(
    app,
    config,
    logger,
    fastifyInstance,
    httpAdapterHost
  );

  await fastifyHttpServer.listen(config.port || 3000, '0.0.0.0', () => {
    logger.log(
      `🚀 Application is running on: http://localhost:${config.port}/${config.prefix}`
    );
  });

  // return server;
}
