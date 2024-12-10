import { DynamicModule, Module } from '@nestjs/common';
import { DataSource, DataSourceOptions } from 'typeorm';
import { EntitiesMetadataStorage } from './entities-metadata.storage';
import { EntityClassOrSchema } from './interfaces/entity-class-or-schema.type';
import {
  TypeOrmModuleAsyncOptions,
  TypeOrmModuleOptions,
} from './interfaces/typeorm-options.interface';
import { TypeOrmCoreModule } from './typeorm-core.module';
import { DEFAULT_DATA_SOURCE_NAME } from './typeorm.constants';
import { createTypeOrmProviders } from './typeorm.providers';
/**
 * TypeORM模块类
 *
 * @description
 * 提供了三种初始化TypeORM的方式:
 * 1. forRoot() - 同步配置初始化
 * 2. forFeature() - 注册实体和仓库
 * 3. forRootAsync() - 异步配置初始化
 */
@Module({})
export class TypeOrmModule {
  /**
   * 同步方式初始化TypeORM
   *
   * @param options TypeORM模块配置选项
   * @returns DynamicModule 配置好的动态模块
   */
  static forRoot(options?: TypeOrmModuleOptions): DynamicModule {
    return {
      module: TypeOrmModule,
      imports: [TypeOrmCoreModule.forRoot(options)],
    };
  }

  /**
   * 注册实体和对应的Repository
   *
   * @param entities 要注册的实体类数组
   * @param dataSource 数据源配置,可以是DataSource实例、配置对象或数据源名称
   * @returns DynamicModule 包含Repository提供者的动态模块
   */
  static forFeature(
    entities: EntityClassOrSchema[] = [],
    dataSource:
      | DataSource
      | DataSourceOptions
      | string = DEFAULT_DATA_SOURCE_NAME,
  ): DynamicModule {
    const providers = createTypeOrmProviders(entities, dataSource);
    EntitiesMetadataStorage.addEntitiesByDataSource(dataSource, [...entities]);
    return {
      module: TypeOrmModule,
      providers: providers,
      exports: providers,
    };
  }

  /**
   * 异步方式初始化TypeORM
   *
   * @description 支持使用工厂模式、useClass等方式异步加载配置
   * @param options 异步初始化配置选项
   * @returns DynamicModule 配置好的动态模块
   */
  static forRootAsync(options: TypeOrmModuleAsyncOptions): DynamicModule {
    return {
      module: TypeOrmModule,
      imports: [TypeOrmCoreModule.forRootAsync(options)],
    };
  }
}
