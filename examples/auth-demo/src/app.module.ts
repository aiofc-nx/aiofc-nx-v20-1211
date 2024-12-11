import { Module } from '@nestjs/common';
import { typedConfigModuleForRoot } from '@aiofc/config';
import rootConfig from './config/root.config';
import {
  AcceptLanguageResolver,
  HeaderResolver,
  I18nJsonLoader,
  I18nModule,
  QueryResolver,
} from '@aiofc/i18n';
import {
  TokenAccessCheckService,
  TokenService,
  JwtStrategy,
  AbstractAccessCheckService,
  AbstractTenantResolutionService,
  AuthConfig,
  JwtAuthGuard,
  AccessGuard,
} from '@aiofc/auth';
import { join } from 'path';
import { Logger, loggerModuleForRootAsync } from '@aiofc/logger';
import { FastifyRequest } from 'fastify';
import { TypeOrmModule, typeOrmModuleConfig } from '@aiofc/nestjs-typeorm';
import * as Entities from '@aiofc/entities';
import * as Controllers from './controllers';
import * as Repositories from './repositories';
import * as Services from './services';
import { ClsModule } from '@aiofc/nestjs-cls';
import { APP_GUARD } from '@nestjs/core';
import { AuthConfigMock } from './config/auth-config.mock';
import { NoOpTenantResolutionService } from './utils/no-op-tenant-resolution-service';
import { SkipAuthController } from './controllers/skip-auth.controller';
import { AuthController } from './controllers/auth.controller';
import { RefreshTokenAuthController } from './controllers/refresh-token-auth.controller';
import { RolesController } from './controllers/roles.controller';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    ClsModule.forRoot({
      global: true, // 将在整个应用程序中全局可用，而不需要在每个模块中单独导入
      middleware: {
        // 对于 HTTP 传输，上下文最好可以在 ClsMiddleware 中设置
        mount: true, // 中间件将被挂载到应用程序中，以便在每个请求的生命周期内启用 CLS
        generateId: true, // 中间件将为每个请求生成一个唯一的 ID
        // 指定cls设定上下文时执行的回调函数
        setup: (cls, req: FastifyRequest) => {
          // put some additional default info in the CLS
          // 把每一个请求的id放到cls中，用以追踪请求的生命周期
          cls.set('requestId', req.id?.toString());
        },
        idGenerator: (req: FastifyRequest) => req.id.toString(),
      },
    }),
    typedConfigModuleForRoot(__dirname, rootConfig),
    loggerModuleForRootAsync(),
    // i18nModuleForRootAsync(__dirname),
    I18nModule.forRoot({
      fallbackLanguage: 'zh',
      loaders: [
        new I18nJsonLoader({
          path: join(__dirname, '/i18n/'),
        }),
      ],
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
        new HeaderResolver(['x-lang']),
      ],
    }),

    typeOrmModuleConfig(), // 全局
    // 是否需要讲这些实体与数据库同步需要再配置文件.env.yaml中配置：synchronize: true
    TypeOrmModule.forFeature(Object.values(Entities)), // 局部
  ],

  controllers: [
    ...Object.values(Controllers),
    SkipAuthController,
    AuthController,
    RefreshTokenAuthController,
    RolesController,
  ],
  providers: [
    ...Object.values(Services),
    ...Object.values(Repositories),
    Logger,
    TokenService,
    JwtService,
    JwtStrategy,
    {
      useClass: TokenAccessCheckService,
      provide: AbstractAccessCheckService,
    },
    {
      useClass: NoOpTenantResolutionService,
      provide: AbstractTenantResolutionService,
    },
    {
      useClass: AuthConfigMock,
      provide: AuthConfig,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AccessGuard,
    },
  ],
  // exports: [AbstractAuthUserService],
})
export class AppModule {}
