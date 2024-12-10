// import { NestFactory } from '@nestjs/core';
// import { useContainer } from 'class-validator';
// import { FastifyInstance } from 'fastify';
// import { createFastifyInstance, initialize } from './setup';
// import { NestFastifyApplication } from '@nestjs/platform-fastify';
// import { AppConfig } from '../config/app.config';
// import { Logger } from '@aiofc/logger';

// export async function fastifyBootstrap(module: any) {
//   const app = await NestFactory.create<NestFastifyApplication>(
//     module,
//     createFastifyInstance(),
//     // 设置为 true 时，日志消息将被暂时存储（缓冲）而不是立即输出。
//     { bufferLogs: true }
//   );
//   useContainer(app.select(module), { fallbackOnErrors: true });

//   const config = app.get(AppConfig);
//   const logger = app.get(Logger);
//   // 直接访问和操作 Fastify 实例，利用 Fastify 提供的各种功能和插件来扩展和定制你的 NestJS 应用程序。
//   const fastifyInstance: FastifyInstance = app.getHttpAdapter().getInstance();

//   initialize(app, config, logger, fastifyInstance);

//   await app.listen(config.port || 3000, '0.0.0.0');
//   logger.log(
//     `🚀 Application is running on: http://localhost:${config.port}/${config.prefix}`
//   );

//   // return app;
// }
