import { ModuleMetadata, Provider, Type } from '@nestjs/common';
import { DataSource, DataSourceOptions } from 'typeorm';

/**
 * TypeORM模块配置选项接口
 *
 * @description
 * 定义了TypeORM模块的配置选项,包括:
 * - 连接重试相关配置
 * - 实体加载配置
 * - 数据库连接生命周期配置
 * - 日志和初始化配置
 * 继承了TypeORM的DataSourceOptions配置
 */
export type TypeOrmModuleOptions = {
  /**
   * 连接重试次数
   * 默认值: 10
   */
  retryAttempts?: number;

  /**
   * 连接重试间隔时间(毫秒)
   * 默认值: 3000
   */
  retryDelay?: number;

  /**
   * 决定是否在连接失败时重试的函数
   * @param err 抛出的错误
   * @returns 是否重试连接
   */
  toRetry?: (err: any) => boolean;

  /**
   * 是否自动加载实体
   * 如果为true,将自动加载所有实体
   */
  autoLoadEntities?: boolean;

  /**
   * 应用关闭时是否保持连接
   * 如果为true,应用关闭时不会关闭数据库连接
   * @deprecated 已废弃
   */
  keepConnectionAlive?: boolean;

  /**
   * 是否显示详细的重试日志
   * 如果为true,每次连接重试都会显示详细的错误信息
   */
  verboseRetryLog?: boolean;

  /**
   * 是否手动初始化数据库
   * 如果为true:
   * - 模块初始化时不会建立数据库连接
   * - 不会自动运行迁移
   * - 需要手动调用DataSource.initialize初始化
   * - 需要自行实现重试机制
   */
  manualInitialization?: boolean;
} & Partial<DataSourceOptions>;

/**
 * TypeORM选项工厂接口
 * 用于创建TypeORM模块配置选项
 */
export interface TypeOrmOptionsFactory {
  createTypeOrmOptions(
    connectionName?: string,
  ): Promise<TypeOrmModuleOptions> | TypeOrmModuleOptions;
}

/**
 * TypeORM数据源工厂类型
 * 用于创建DataSource实例的工厂函数
 */
export type TypeOrmDataSourceFactory = (
  options?: DataSourceOptions,
) => Promise<DataSource>;

/**
 * TypeORM模块异步配置选项接口
 *
 * @description
 * 支持多种异步配置方式:
 * - useFactory: 使用工厂函数
 * - useClass: 使用类
 * - useExisting: 使用已存在的服务
 */
export interface TypeOrmModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  name?: string;
  useExisting?: Type<TypeOrmOptionsFactory>;
  useClass?: Type<TypeOrmOptionsFactory>;
  useFactory?: (
    ...args: any[]
  ) => Promise<TypeOrmModuleOptions> | TypeOrmModuleOptions;
  dataSourceFactory?: TypeOrmDataSourceFactory;
  inject?: any[];
  extraProviders?: Provider[];
}
