import { Module } from '@nestjs/common';
import { AppService } from './app/services/app.service';
import * as Controllers from './app/controllers';
import * as Repositories from './app/repositories';
import * as Services from './app/services';
import { ClsModule } from '@aiofc/nestjs-cls';
import { FastifyRequest } from 'fastify';
import rootConfig from './config/root.config';
import { typedConfigModuleForRoot } from '@aiofc/config';
import { Logger, loggerModuleForRootAsync } from '@aiofc/logger';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { i18nModuleForRootAsync } from '@aiofc/i18n';
import { TypeOrmModule, typeOrmModuleConfig } from '@aiofc/nestjs-typeorm';
import entities from '@aiofc/entities';
import { AbstractSignupService } from './app/services/auth/signup/abstract-signup.service';
import { TenantSignupService } from './app/services/auth/signup/tenant-signup.service';
import AbstractAuthUserService from './app/services/auth/abstract-auth-user.service';
import AuthUserService from './app/services/users/auth-user.service';
import {
  AbstractAccessCheckService,
  AbstractTenantResolutionService,
  AbstractTokenBuilderService,
  AccessGuard,
  HeaderTenantResolutionService,
  JwtAuthGuard,
  TokenService,
} from '@aiofc/auth';
import { MultiTenantTokenBuilderService } from './app/services/auth/token/multi-tenant-token-builder.service';
import { APP_GUARD } from '@nestjs/core';
import { AccessCheckService } from './app/services/roles/access-check.service';
import {
  ClsPresetSubscriber,
  OptimisticLockingSubscriber,
} from '@aiofc/typeorm-base';
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
    i18nModuleForRootAsync(__dirname),
    // I18nModule.forRoot({
    //   fallbackLanguage: 'zh',
    //   loaders: [
    //     new I18nJsonLoader({
    //       path: join(__dirname, '/i18n/'),
    //     }),
    //   ],
    //   resolvers: [
    //     { use: QueryResolver, options: ['lang'] },
    //     AcceptLanguageResolver,
    //     new HeaderResolver(['x-lang']),
    //   ],
    // }),
    typeOrmModuleConfig(), // 全局
    // 是否需要讲这些实体与数据库同步需要再配置文件.env.yaml中配置：synchronize: true
    TypeOrmModule.forFeature(Object.values(entities)), // 局部
    JwtModule,
  ],
  controllers: Object.values(Controllers),
  providers: [
    ...Object.values(Services),
    ...Object.values(Repositories),
    OptimisticLockingSubscriber,
    ClsPresetSubscriber,
    Logger,
    JwtService,
    TokenService,
    AppService,
    {
      provide: AbstractAuthUserService,
      useClass: AuthUserService,
    },
    {
      provide: AbstractTokenBuilderService,
      useClass: MultiTenantTokenBuilderService,
    },
    {
      provide: AbstractTenantResolutionService,
      useClass: HeaderTenantResolutionService,
    },
    {
      provide: AbstractAccessCheckService,
      useClass: AccessCheckService,
    },
    {
      provide: AbstractSignupService,
      useClass: TenantSignupService,
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
})
export class AppModule {}
