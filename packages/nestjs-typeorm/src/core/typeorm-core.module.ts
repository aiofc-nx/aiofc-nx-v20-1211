import {
  DynamicModule,
  Global,
  Inject,
  Logger,
  Module,
  OnApplicationShutdown,
  Provider,
  Type,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { defer, lastValueFrom } from 'rxjs';
import {
  Connection,
  createConnection,
  DataSource,
  DataSourceOptions,
} from 'typeorm';
import {
  generateString,
  getDataSourceName,
  getDataSourceToken,
  getEntityManagerToken,
  handleRetry,
} from './common/typeorm.utils';
import { EntitiesMetadataStorage } from './entities-metadata.storage';
import {
  TypeOrmDataSourceFactory,
  TypeOrmModuleAsyncOptions,
  TypeOrmModuleOptions,
  TypeOrmOptionsFactory,
} from './interfaces/typeorm-options.interface';
import { TYPEORM_MODULE_ID, TYPEORM_MODULE_OPTIONS } from './typeorm.constants';
/**
 * TypeOrmCoreModule 类
 *
 * @description
 * TypeORM的核心模块,负责管理数据库连接和实体管理器。
 * 提供了两种初始化方式:
 * 1. forRoot() - 同步初始化
 * 2. forRootAsync() - 异步初始化
 *
 * 主要功能:
 * - 创建和管理数据源连接
 * - 提供实体管理器
 * - 处理应用关闭时的清理工作
 * - 支持异步配置
 */
@Global()
@Module({})
export class TypeOrmCoreModule implements OnApplicationShutdown {
  /**
   * 日志记录器实例
   */
  private readonly logger = new Logger('TypeOrmModule');

  /**
   * 构造函数
   * @param options - TypeORM模块配置选项
   * @param moduleRef - 模块引用,用于获取提供者实例
   */
  constructor(
    @Inject(TYPEORM_MODULE_OPTIONS)
    private readonly options: TypeOrmModuleOptions,
    private readonly moduleRef: ModuleRef,
  ) {}

  /**
   * 同步初始化TypeORM
   * @param options - TypeORM配置选项
   * @returns DynamicModule - 配置好的动态模块
   */
  static forRoot(options: TypeOrmModuleOptions = {}): DynamicModule {
    const typeOrmModuleOptions = {
      provide: TYPEORM_MODULE_OPTIONS,
      useValue: options,
    };
    const dataSourceProvider = {
      provide: getDataSourceToken(options as DataSourceOptions),
      useFactory: async () => await this.createDataSourceFactory(options),
    };
    const entityManagerProvider = this.createEntityManagerProvider(
      options as DataSourceOptions,
    );

    const providers = [
      entityManagerProvider,
      dataSourceProvider,
      typeOrmModuleOptions,
    ];
    const exports = [entityManagerProvider, dataSourceProvider];

    // TODO: "Connection" class is going to be removed in the next version of "typeorm"
    if (dataSourceProvider.provide === DataSource) {
      providers.push({
        provide: Connection,
        useExisting: DataSource,
      });
      exports.push(Connection);
    }

    return {
      module: TypeOrmCoreModule,
      providers,
      exports,
    };
  }

  /**
   * 异步初始化TypeORM
   * @param options - 异步配置选项
   * @returns DynamicModule - 配置好的动态模块
   */
  static forRootAsync(options: TypeOrmModuleAsyncOptions): DynamicModule {
    const dataSourceProvider = {
      provide: getDataSourceToken(options as DataSourceOptions),
      useFactory: async (typeOrmOptions: TypeOrmModuleOptions) => {
        if (options.name) {
          return await this.createDataSourceFactory(
            {
              ...typeOrmOptions,
              name: options.name,
            },
            options.dataSourceFactory,
          );
        }
        return await this.createDataSourceFactory(
          typeOrmOptions,
          options.dataSourceFactory,
        );
      },
      inject: [TYPEORM_MODULE_OPTIONS],
    };
    const entityManagerProvider = {
      provide: getEntityManagerToken(options as DataSourceOptions) as string,
      useFactory: (dataSource: DataSource) => dataSource.manager,
      inject: [getDataSourceToken(options as DataSourceOptions)],
    };

    const asyncProviders = this.createAsyncProviders(options);
    const providers = [
      ...asyncProviders,
      entityManagerProvider,
      dataSourceProvider,
      {
        provide: TYPEORM_MODULE_ID,
        useValue: generateString(),
      },
      ...(options.extraProviders || []),
    ];
    const exports: Array<Provider | Function> = [
      entityManagerProvider,
      dataSourceProvider,
    ];

    // TODO: "Connection" class is going to be removed in the next version of "typeorm"
    if (dataSourceProvider.provide === DataSource) {
      providers.push({
        provide: Connection,
        useExisting: DataSource,
      });
      exports.push(Connection);
    }

    return {
      module: TypeOrmCoreModule,
      imports: options.imports,
      providers,
      exports,
    };
  }

  /**
   * 应用关闭时的清理工作
   * 负责关闭数据库连接
   */
  async onApplicationShutdown(): Promise<void> {
    const dataSource = this.moduleRef.get<DataSource>(
      getDataSourceToken(this.options as DataSourceOptions) as Type<DataSource>,
    );
    try {
      if (dataSource && dataSource.isInitialized) {
        await dataSource.destroy();
      }
    } catch (e) {
      this.logger.error((e as Error)?.message);
    }
  }

  /**
   * 创建异步提供者
   * @param options - 异步配置选项
   * @returns Provider[] - 提供者数组
   */
  private static createAsyncProviders(
    options: TypeOrmModuleAsyncOptions,
  ): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }
    const useClass = options.useClass as Type<TypeOrmOptionsFactory>;
    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: useClass,
        useClass,
      },
    ];
  }

  /**
   * 创建异步选项提供者
   * @param options - 异步配置选项
   * @returns Provider - 配置提供者
   */
  private static createAsyncOptionsProvider(
    options: TypeOrmModuleAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: TYPEORM_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }
    const inject = [
      (options.useClass || options.useExisting) as Type<TypeOrmOptionsFactory>,
    ];
    return {
      provide: TYPEORM_MODULE_OPTIONS,
      useFactory: async (optionsFactory: TypeOrmOptionsFactory) =>
        await optionsFactory.createTypeOrmOptions(options.name),
      inject,
    };
  }

  /**
   * 创建实体管理器提供者
   * @param options - 数据源配置选项
   * @returns Provider - 实体管理器提供者
   */
  private static createEntityManagerProvider(
    options: DataSourceOptions,
  ): Provider {
    return {
      provide: getEntityManagerToken(options) as string,
      useFactory: (dataSource: DataSource) => dataSource.manager,
      inject: [getDataSourceToken(options)],
    };
  }

  /**
   * 创建数据源工厂
   * @param options - TypeORM配置选项
   * @param dataSourceFactory - 可选的自定义数据源工厂
   * @returns Promise<DataSource> - 初始化后的数据源
   */
  private static async createDataSourceFactory(
    options: TypeOrmModuleOptions,
    dataSourceFactory?: TypeOrmDataSourceFactory,
  ): Promise<DataSource> {
    const dataSourceToken = getDataSourceName(options as DataSourceOptions);
    const createTypeormDataSource =
      dataSourceFactory ??
      ((options: DataSourceOptions) => {
        return DataSource === undefined
          ? createConnection(options)
          : new DataSource(options);
      });
    return await lastValueFrom(
      defer(async () => {
        let dataSource: DataSource;
        if (!options.autoLoadEntities) {
          dataSource = await createTypeormDataSource(
            options as DataSourceOptions,
          );
        } else {
          let entities = options.entities;
          if (Array.isArray(entities)) {
            entities = entities.concat(
              EntitiesMetadataStorage.getEntitiesByDataSource(dataSourceToken),
            );
          } else {
            entities =
              EntitiesMetadataStorage.getEntitiesByDataSource(dataSourceToken);
          }
          dataSource = await createTypeormDataSource({
            ...options,
            entities,
          } as DataSourceOptions);
        }
        // TODO: remove "dataSource.initialize" condition (left for backward compatibility)
        return (dataSource as any).initialize && !dataSource.isInitialized && !options.manualInitialization
          ? dataSource.initialize()
          : dataSource;
      }).pipe(
        handleRetry(
          options.retryAttempts,
          options.retryDelay,
          dataSourceToken,
          options.verboseRetryLog,
          options.toRetry,
        ),
      ),
    );
  }
}
