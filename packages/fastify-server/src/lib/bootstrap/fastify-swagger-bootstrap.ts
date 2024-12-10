import { NestFactory } from '@nestjs/core';
// import { useContainer } from 'class-validator';
import { buildFastifyAdapter } from './setup';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppConfig } from '../config/app.config';
import { Logger, LoggerErrorInterceptor } from '@aiofc/logger';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { ClassSerializerInterceptor, VersioningType } from '@nestjs/common';
import { HttpAdapterHost, Reflector } from '@nestjs/core';
import {
  AnyExceptionFilter,
  HttpExceptionFilter,
  OverrideDefaultForbiddenExceptionFilter,
  OverrideDefaultNotFoundFilter,
  responseBodyFormatter,
} from '@aiofc/exceptions';
import { I18nValidationExceptionFilter, I18nValidationPipe } from '@aiofc/i18n';
import { DEFAULT_VALIDATION_OPTIONS } from '@aiofc/validation';

import { setupSwagger, SwaggerConfig } from '@aiofc/swagger-utils';
import { callOrUndefinedIfException } from '../utils/functions';

// import { getTransactionalContext } from 'typeorm-transactional/dist/common';


export async function fastifySwaggerBootstrap(module: any) {
  // getTransactionalContext(); //  transition to use AsyncCls instead of ClsHook
  initializeTransactionalContext();
    //  transition to use AsyncCls instead of ClsHook
  // const transactionalContext = getTransactionalContext();

  // // this is needed for tests to prevent multiple initializations
  // if (!transactionalContext) {
  //   initializeTransactionalContext();
  // }
const app = await NestFactory.create<NestFastifyApplication>(
    module,
    buildFastifyAdapter(),
  );
  // const app = await NestFactory.create<NestFastifyApplication>(
  //   module,
  //   buildFastifyAdapter(),
  //   // 设置为 true 时，日志消息将被暂时存储（缓冲）而不是立即输出。
  //   {
  //     bufferLogs: true,
  //   }
  // );
  // useContainer(app.select(module), { fallbackOnErrors: true });

  const config = app.get(AppConfig);
  const logger = app.get(Logger);
  // 直接访问和操作 Fastify 实例，利用 Fastify 提供的各种功能和插件来扩展和定制你的 NestJS 应用程序。
  // const fastifyInstance: FastifyInstance = app.getHttpAdapter().getInstance();
  // 从依赖注入容器中获取了一个 HttpAdapterHost 实例，确保在需要时能够访问和操作底层的 HTTP 服务器实例。
  const httpAdapterHost = app.get(HttpAdapterHost);
  // 在应用程序时注册全局的日志记录器
  app.useLogger(logger);
  app.flushLogs(); // 刷新日志：将内存中的日志数据写入到持久存储（如文件或数据库）中
  app.setGlobalPrefix(config.prefix || 'api');
  const swaggerConfig = callOrUndefinedIfException(() =>
    app.get(SwaggerConfig),
  );
  // 启用跨域请求
  app.enableCors(config.cors);
  // 用于启用 API 版本控制。这里使用了 URI 版本控制策略。
  app.enableVersioning({
    type: VersioningType.URI,
  });
  // TODO: 启用 Swagger 文档
  if (swaggerConfig instanceof SwaggerConfig) {
    const swaggerSetup = setupSwagger(swaggerConfig, app, config.prefix);
    const swaggerPath = `${config.prefix}${swaggerConfig.swaggerPath}`;

    if (swaggerSetup) {
      logger.log(`Swagger is listening on ${swaggerPath}`);
    } else {
      logger.log(`Swagger is disabled by config, skipping...`);
    }
  } else {
    logger.debug(
      `SwaggerConfig instance is not provided so swagger turned off by default, skipping... Details: %o`,
      swaggerConfig,
    );
  }

  // TODO: 全局的类验证管道，用于处理请求数据的验证,支持国际化多语言
  app.useGlobalPipes(new I18nValidationPipe(DEFAULT_VALIDATION_OPTIONS));

  // TODO: 全局的异常过滤器,内部包含了一些默认的异常过滤器
  app.useGlobalFilters(
    new I18nValidationExceptionFilter({
      responseBodyFormatter, // 格式化响应体
      detailedErrors: true, // 是否在响应中包含详细的错误信息,生产环境中应该设置为false
    }),
    new AnyExceptionFilter(httpAdapterHost as any),
    new OverrideDefaultNotFoundFilter(httpAdapterHost as any),
    new OverrideDefaultForbiddenExceptionFilter(httpAdapterHost as any),
    new HttpExceptionFilter(httpAdapterHost as any)

    // 加入更多的Filter
    // new PostgresDbQueryFailedErrorFilter(httpAdapterHost as any),
  );

  // TODO:设置全局拦截器
  // 用于自动序列化和反序列化类实例，确保响应数据符合预期的格式
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  // 用于捕获和记录应用程序中的错误日志
  app.useGlobalInterceptors(new LoggerErrorInterceptor());
  await app.listen(config.port || 3000, '0.0.0.0', () => {
    logger.log(
      `🚀 Application is running on: http://localhost:${config.port}/${config.prefix}`
    );
  });

  // return server;
}
