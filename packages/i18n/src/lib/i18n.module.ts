import {
  DynamicModule,
  Global,
  Inject,
  Logger,
  MiddlewareConsumer,
  Module,
  NestModule,
  OnModuleInit,
  Provider,
  ValueProvider,
} from '@nestjs/common';
import {
  I18N_LANGUAGES,
  I18N_LOADERS,
  I18N_OPTIONS,
  I18N_RESOLVERS,
  I18N_TRANSLATIONS,
} from './i18n.constants';
import { I18nService } from './services/i18n.service';
import {
  I18nAsyncOptions,
  I18nOptionResolver,
  I18nOptions,
  I18nOptionsFactory,
} from './interfaces/i18n-options.interface';
import { I18nLanguageInterceptor } from './interceptors/i18n-language.interceptor';
import { APP_INTERCEPTOR, HttpAdapterHost } from '@nestjs/core';
import { getI18nResolverOptionsToken } from './decorators/i18n-resolver-options.decorator';
import { isNestMiddleware, shouldResolve, usingFastify } from './utils/util';
import { I18nTranslation } from './interfaces/i18n-translation.interface';
import { I18nLoader } from './loaders/i18n.loader';
import format from 'string-format';
import { I18nMiddleware } from './middlewares/i18n.middleware';
import { processLanguages, processTranslations } from './utils/loaders-utils';
import { isResolverWithOptions } from './utils/type-guards';
/**
 * 创建一个全局的日志记录器实例,用于记录 I18nService 相关的日志
 */
export const logger = new Logger('I18nService');

/**
 * 默认的国际化配置选项
 * - resolvers: 语言解析器数组,默认为空
 * - formatter: 字符串格式化函数,默认使用 string-format 库
 * - logging: 是否启用日志,默认为 true
 * - throwOnMissingKey: 当翻译键不存在时是否抛出异常,默认为 false
 */
const defaultOptions: Partial<I18nOptions> = {
  resolvers: [],
  formatter: format,
  logging: true,
  throwOnMissingKey: false,
};

/**
 * I18n 模块类
 * @description 全局模块,用于处理国际化相关功能
 * 实现了 OnModuleInit 和 NestModule 接口,可以在模块初始化和配置中间件时执行相关逻辑
 */
@Global()
@Module({})
export class I18nModule implements OnModuleInit, NestModule {
  constructor(
    private readonly i18n: I18nService,
    @Inject(I18N_OPTIONS) private readonly i18nOptions: I18nOptions,
    private adapter: HttpAdapterHost
  ) {}

  /**
   * 同步配置 I18n 模块的静态方法
   * @param options I18n 配置选项
   * @returns DynamicModule 动态模块配置
   */
  static forRoot(options: I18nOptions): DynamicModule {
    options = this.sanitizeI18nOptions(options);

    const i18nOptions: ValueProvider = {
      provide: I18N_OPTIONS,
      useValue: options,
    };

    const i18nLoaderProvider: ValueProvider = {
      provide: I18N_LOADERS,
      useValue: options.loaders,
    };

    const translationsProvider = {
      provide: I18N_TRANSLATIONS,
      useFactory: async (
        loaders: I18nLoader<unknown>[]
      ): Promise<I18nTranslation> => {
        return processTranslations(loaders);
      },
      inject: [I18N_LOADERS],
    };

    const languagesProvider = {
      provide: I18N_LANGUAGES,
      useFactory: async (loaders: I18nLoader<unknown>[]): Promise<string[]> => {
        return processLanguages(loaders);
      },
      inject: [I18N_LOADERS],
    };

    const resolversProvider = {
      provide: I18N_RESOLVERS,
      useValue: options.resolvers || [],
    };

    return {
      module: I18nModule,
      providers: [
        { provide: Logger, useValue: logger },
        {
          provide: APP_INTERCEPTOR,
          useClass: I18nLanguageInterceptor,
        },
        I18nService,
        i18nOptions,
        translationsProvider,
        languagesProvider,
        resolversProvider,
        i18nLoaderProvider,
        ...this.createResolverProviders(options.resolvers),
      ],
      exports: [I18N_OPTIONS, I18N_RESOLVERS, I18nService, languagesProvider],
    };
  }

  /**
   * 异步配置 I18n 模块的静态方法
   * @param options I18n 异步配置选项
   * @returns DynamicModule 动态模块配置
   */
  static forRootAsync(options: I18nAsyncOptions): DynamicModule {
    options = this.sanitizeI18nOptions(options);

    const asyncOptionsProvider = this.createAsyncOptionsProvider(options);
    const asyncTranslationProvider = this.createAsyncTranslationProvider();
    const asyncLanguagesProvider = this.createAsyncLanguagesProvider();
    const asyncLoadersProvider = this.createAsyncLoadersProvider();

    const resolversProvider: ValueProvider = {
      provide: I18N_RESOLVERS,
      useValue: options.resolvers || [],
    };

    return {
      module: I18nModule,
      imports: options.imports || [],
      providers: [
        { provide: Logger, useValue: logger },
        {
          provide: APP_INTERCEPTOR,
          useClass: I18nLanguageInterceptor,
        },
        asyncOptionsProvider,
        asyncTranslationProvider,
        asyncLanguagesProvider,
        I18nService,
        resolversProvider,
        asyncLoadersProvider,
        ...this.createResolverProviders(options.resolvers),
      ],
      exports: [
        I18N_OPTIONS,
        I18N_RESOLVERS,
        I18N_LOADERS,
        I18nService,
        asyncLanguagesProvider,
      ],
    };
  }

  /**
   * 创建异步加载器提供者
   * @returns Provider 提供者配置
   */
  private static createAsyncLoadersProvider(): Provider {
    return {
      provide: I18N_LOADERS,
      useFactory: async (options: I18nOptions) => {
        return options.loaders;
      },
      inject: [I18N_OPTIONS],
    };
  }

  /**
   * 创建异步选项提供者
   * @param options I18n 异步配置选项
   * @returns Provider 提供者配置
   */
  private static createAsyncOptionsProvider(
    options: I18nAsyncOptions
  ): Provider {
    if (options.useFactory) {
      const factory = options.useFactory;

      return {
        provide: I18N_OPTIONS,
        useFactory: async (...args) => {
          const resolvers = await factory(...args);
          return this.sanitizeI18nOptions(resolvers);
        },
        inject: options.inject || [],
      };
    }

    const existingOrClass = options.useClass || options.useExisting;
    if (existingOrClass) {
      return {
        provide: I18N_OPTIONS,
        useFactory: async (optionsFactory: I18nOptionsFactory) =>
          this.sanitizeI18nOptions(
            (await optionsFactory.createI18nOptions()) as any
          ),
        inject: [existingOrClass],
      };
    }

    throw new Error(
      'Invalid I18n async options, useClass or useExisting or useFactory must be provided'
    );
  }

  /**
   * 创建异步翻译提供者
   * @returns Provider 提供者配置
   */
  private static createAsyncTranslationProvider(): Provider {
    return {
      provide: I18N_TRANSLATIONS,
      useFactory: async (
        loaders: I18nLoader<unknown>[]
      ): Promise<I18nTranslation> => {
        return processTranslations(loaders);
      },
      inject: [I18N_LOADERS],
    };
  }

  /**
   * 创建异步语言提供者
   * @returns Provider 提供者配置
   */
  private static createAsyncLanguagesProvider(): Provider {
    return {
      provide: I18N_LANGUAGES,
      useFactory: async (loaders: I18nLoader<unknown>[]): Promise<string[]> => {
        return processLanguages(loaders);
      },
      inject: [I18N_LOADERS],
    };
  }

  /**
   * 清理和合并国际化配置选项
   * @description 用于清理和合并国际化（i18n）配置选项
   * 方法确保了国际化配置选项的完整性和一致性。无论传入的选项是同步的还是异步的，这个方法都能正确处理，
   * 并返回一个包含默认选项和传入选项的合并对象。这对于确保国际化模块的配置始终有效和一致非常重要
   */
  private static sanitizeI18nOptions<T = I18nOptions | I18nAsyncOptions>(
    options: T
  ) {
    options = { ...defaultOptions, ...options };
    return options;
  }

  /**
   * 创建解析器提供者数组
   * @param resolvers 解析器配置数组
   * @returns Provider[] 提供者配置数组
   */
  private static createResolverProviders(resolvers?: I18nOptionResolver[]) {
    if (!resolvers || resolvers.length === 0) {
      logger.error(
        `No resolvers provided! @aiofc/i18n won't work properly, please follow the quick-start guide: https://docs.softkit.dev/libraries/i18n/quick-start`
      );
    }
    return (resolvers || [])
      .filter(shouldResolve)
      .reduce<Provider[]>((providers, r) => {
        if (isResolverWithOptions(r)) {
          const { use: resolver, options, ...rest } = r as any;
          const optionsToken = getI18nResolverOptionsToken(
            resolver as unknown as () => void
          );
          providers.push({
            provide: resolver,
            useClass: resolver,
          });
          if (options) {
            (rest as any).useValue = options;
          }
          providers.push({
            provide: optionsToken,
            ...(rest as any),
          });
        } else {
          const optionsToken = getI18nResolverOptionsToken(
            r as unknown as () => void
          );
          providers.push(
            {
              provide: r,
              useClass: r,
              inject: [optionsToken],
            } as any,
            {
              provide: optionsToken,
              // eslint-disable-next-line @typescript-eslint/no-empty-function
              useFactory: () => {},
            }
          );
        }

        return providers;
      }, []);
  }

  /**
   * 模块初始化时执行的方法
   * 加载语言和翻译,注册模板引擎辅助函数
   */
  async onModuleInit() {
    // makes sure languages & translations are loaded before application loads
    await this.i18n.refresh();

    // Register handlebars helper
    if (this.i18nOptions.viewEngine === 'hbs') {
      try {
        const hbs = (await import('hbs')).default;
        hbs.registerHelper('t', this.i18n.hbsHelper);
        logger.log('Handlebars helper registered');
      } catch (error) {
        logger.error('hbs module failed to load', error);
      }
    }

    if (
      this.i18nOptions.viewEngine &&
      ['pug', 'ejs'].includes(this.i18nOptions.viewEngine)
    ) {
      const app = this.adapter.httpAdapter.getInstance();
      app.locals['t'] = (key: string, lang: any, args: any) => {
        return this.i18n.t(key, { lang, args });
      };
    }
  }

  /**
   * 配置中间件
   * @param consumer 中间件消费者
   */
  configure(consumer: MiddlewareConsumer) {
    if (this.i18nOptions.disableMiddleware) return;

    const nestMiddleware = isNestMiddleware(consumer);
    consumer
      .apply(I18nMiddleware)
      .forRoutes(nestMiddleware && usingFastify(consumer) ? '(.*)' : '*');
  }
}
