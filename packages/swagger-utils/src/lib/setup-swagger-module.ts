import {
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { SwaggerConfig } from './config/swagger';

/**
 * 设置Swagger文档模块
 *
 * @description
 * 该函数用于设置和配置Swagger API文档:
 *
 * 1. 功能说明
 * - 支持配置多个Swagger实例,如公开和私有API文档
 * - 根据配置自动生成API文档
 * - 支持Bearer token认证
 * - 支持配置多个服务器环境
 *
 * 2. 参数说明
 * - c: SwaggerConfig - Swagger配置对象
 * - app: NestFastifyApplication - Fastify应用实例
 * - appPrefix?: string - 可选的URL前缀
 *
 * 3. 实现步骤
 * - 检查是否启用Swagger
 * - 创建文档构建器并设置基本信息
 * - 添加服务器配置
 * - 生成Swagger文档
 * - 设置文档访问路径
 * - 返回生成的文档对象
 */
export function setupSwagger(
  c: SwaggerConfig,
  app: NestFastifyApplication,
  appPrefix?: string,
) {
  /* 如果未启用Swagger则直接返回 */
  if (!c.enabled) {
    return;
  }

  /* 创建文档构建器并设置基本信息 */
  const options = new DocumentBuilder()
    .setTitle(c.title)
    .setDescription(c.description)
    .setVersion(c.version)
    .setContact(c.contactName, c.contactUrl, c.contactEmail)
    .addBearerAuth();

  /* 添加服务器配置 */
  for (const server of c?.servers || []) {
    options.addServer(server.url, server.description);
  }

  /* 生成Swagger文档 */
  const document = SwaggerModule.createDocument(app, options.build());

  /* 构建Swagger访问路径 */
  const swaggerPath = appPrefix
    ? `/${appPrefix}/${c.swaggerPath}`.replaceAll('//', '/')
    : c.swaggerPath;

  /* 设置Swagger文档并配置持久化认证 */
  SwaggerModule.setup(swaggerPath, app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  return document;
}
