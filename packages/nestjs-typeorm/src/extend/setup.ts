import { DataSource, DataSourceOptions } from 'typeorm';
import { getDataSourceByName } from 'typeorm-transactional/dist/common';
import { addTransactionalDataSource } from 'typeorm-transactional';
import {
  DEFAULT_SETUP_TYPEORM_OPTIONS,
  SetupTypeormOptions,
} from './vo/setup-typeorm-options';
import { DynamicModule } from '@nestjs/common';
import { TypeOrmModule } from '../core';
/**
 * 异步初始化TypeORM模块并返回动态模块
 *
 * @description 主要作用是简化 TypeORM 模块的配置和初始化过程，返回一个数据源。
 * 这个函数应当只在应用启动时调用，因为它只执行一次，具有全局性地配置和管理数据库连接。
 *
 * @param options - TypeORM设置选项,包含配置工厂和迁移文件
 * @returns Promise<DynamicModule> - 返回配置好的TypeORM动态模块
 */
function forRootAsync(options?: SetupTypeormOptions): Promise<DynamicModule> {
  /**
   * 合并默认选项和用户提供的选项
   */
  const optionsWithDefault = {
    ...DEFAULT_SETUP_TYPEORM_OPTIONS,
    ...options,
  };

  /**
   * 返回TypeORM动态模块的异步配置
   *
   * 主要做两件事:
   * 1. 使用自定义的TypeOrmConfigService进行模块注册
   * 2. 通过dataSourceFactory异步初始化数据源和数据库连接
   *
   * 注意:此处不注册实体和提供实体操作方法,这些应由TypeOrmModule.forFeature()完成
   */
  return Promise.resolve(TypeOrmModule.forRootAsync({
    // 使用自定义的TypeOrmConfigService类来完成配置
    useClass: optionsWithDefault.optionsFactory,

    /**
     * 数据源工厂函数
     * 负责创建和初始化TypeORM数据源
     *
     * @param baseOptions - 基础数据源配置选项
     * @returns Promise<DataSource> - 返回初始化后的数据源
     */
    dataSourceFactory: async (baseOptions?: DataSourceOptions) => {
      /* istanbul ignore next */
      if (!baseOptions) {
        throw new Error(`Can not initialize data source, options are empty`);
      }

      /**
       * 检查是否已存在默认数据源
       * 如果存在则直接返回,避免重复创建
       */
      const existDatasource = getDataSourceByName('default');
      if (existDatasource) {
        return existDatasource;
      }

      /**
       * 合并基础配置和迁移配置
       * 创建新的数据源实例
       */
      const options = {
        ...baseOptions,
        migrations: optionsWithDefault.migrations,
      };
      const dataSource = new DataSource(options);
      addTransactionalDataSource(dataSource);

      /**
       * 初始化数据源
       * 这是函数的核心功能:建立与数据库的连接
       * 应在应用启动时只调用一次
       * 根据数据库类型可能创建连接或设置连接池
       */
      return await dataSource.initialize();
    },
  }));
}
/**
 * TypeORM模块配置函数
 *
 * 功能说明:
 * - 用于配置和初始化TypeORM模块
 * - 创建数据库连接池
 * - 建议在应用程序全局范围内使用
 *
 * 实现细节:
 * - 通过调用forRootAsync函数完成异步初始化
 * - 支持自定义配置选项
 * - 确保数据库连接的正确建立
 *
 * @param options - TypeORM设置选项
 *   - optionsFactory: 配置工厂类(可选)
 *   - migrations: 数据库迁移文件(可选)
 *
 * @returns Promise<DynamicModule> - 返回配置好的TypeORM动态模块
 */
export function typeOrmModuleConfig(options?: SetupTypeormOptions): Promise<DynamicModule> {
  return forRootAsync(options);
}
