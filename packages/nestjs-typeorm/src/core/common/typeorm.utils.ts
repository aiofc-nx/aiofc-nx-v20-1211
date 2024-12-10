import { Logger, Type } from '@nestjs/common';
import { Observable } from 'rxjs';
import { delay, retryWhen, scan } from 'rxjs/operators';
import {
  AbstractRepository,
  Connection,
  DataSource,
  DataSourceOptions,
  EntityManager,
  EntitySchema,
  Repository,
} from 'typeorm';
import { v4 as uuid } from 'uuid';
import { CircularDependencyException } from '../exceptions/circular-dependency.exception';
import { EntityClassOrSchema } from '../interfaces/entity-class-or-schema.type';
import { DEFAULT_DATA_SOURCE_NAME } from '../typeorm.constants';

/**
 * TypeORM工具函数集合
 *
 * @description
 * 提供了一组用于TypeORM集成的工具函数:
 * - 生成Repository、DataSource、EntityManager的注入令牌
 * - 处理数据库连接重试逻辑
 * - 生成唯一标识符
 */

/**
 * TypeORM模块的日志记录器实例
 */
const logger = new Logger('TypeOrmModule');

/**
 * 生成实体Repository的注入令牌
 *
 * @param entity 实体类或Schema
 * @param dataSource 数据源配置,默认为'default'
 * @returns Repository的注入令牌
 * @throws CircularDependencyException 当检测到循环依赖时
 */
export function getRepositoryToken(
  entity: EntityClassOrSchema,
  dataSource:
    | DataSource
    | DataSourceOptions
    | string = DEFAULT_DATA_SOURCE_NAME,
): Function | string {
  if (entity === null || entity === undefined) {
    throw new CircularDependencyException('@InjectRepository()');
  }
  const dataSourcePrefix = getDataSourcePrefix(dataSource);
  if (
    entity instanceof Function &&
    (entity.prototype instanceof Repository ||
      entity.prototype instanceof AbstractRepository)
  ) {
    if (!dataSourcePrefix) {
      return entity;
    }
    return `${dataSourcePrefix}${getCustomRepositoryToken(entity)}`;
  }

  if (entity instanceof EntitySchema) {
    return `${dataSourcePrefix}${
      entity.options.target ? entity.options.target.name : entity.options.name
    }Repository`;
  }
  return `${dataSourcePrefix}${entity.name}Repository`;
}

/**
 * 生成自定义Repository的注入令牌
 *
 * @param repository Repository类
 * @returns 注入令牌字符串
 * @throws CircularDependencyException 当检测到循环依赖时
 */
export function getCustomRepositoryToken(repository: Function): string {
  if (repository === null || repository === undefined) {
    throw new CircularDependencyException('@InjectRepository()');
  }
  return repository.name;
}

/**
 * 生成DataSource的注入令牌
 *
 * @param dataSource 数据源配置,默认为'default'
 * @returns DataSource的注入令牌
 */
export function getDataSourceToken(
  dataSource:
    | DataSource
    | DataSourceOptions
    | string = DEFAULT_DATA_SOURCE_NAME,
): string | Function | Type<DataSource> {
  return DEFAULT_DATA_SOURCE_NAME === dataSource
    ? DataSource ?? Connection
    : 'string' === typeof dataSource
    ? `${dataSource}DataSource`
    : DEFAULT_DATA_SOURCE_NAME === dataSource.name || !dataSource.name
    ? DataSource ?? Connection
    : `${dataSource.name}DataSource`;
}

/** @deprecated 已废弃,请使用getDataSourceToken */
export const getConnectionToken = getDataSourceToken;

/**
 * 获取数据源前缀
 *
 * @param dataSource 数据源配置,默认为'default'
 * @returns 数据源前缀字符串
 */
export function getDataSourcePrefix(
  dataSource:
    | DataSource
    | DataSourceOptions
    | string = DEFAULT_DATA_SOURCE_NAME,
): string {
  if (dataSource === DEFAULT_DATA_SOURCE_NAME) {
    return '';
  }
  if (typeof dataSource === 'string') {
    return dataSource + '_';
  }
  if (dataSource.name === DEFAULT_DATA_SOURCE_NAME || !dataSource.name) {
    return '';
  }
  return dataSource.name + '_';
}

/**
 * 生成EntityManager的注入令牌
 *
 * @param dataSource 数据源配置,默认为'default'
 * @returns EntityManager的注入令牌
 */
export function getEntityManagerToken(
  dataSource:
    | DataSource
    | DataSourceOptions
    | string = DEFAULT_DATA_SOURCE_NAME,
): string | Function {
  return DEFAULT_DATA_SOURCE_NAME === dataSource
    ? EntityManager
    : 'string' === typeof dataSource
    ? `${dataSource}EntityManager`
    : DEFAULT_DATA_SOURCE_NAME === dataSource.name || !dataSource.name
    ? EntityManager
    : `${dataSource.name}EntityManager`;
}

/**
 * 处理数据库连接重试逻辑
 *
 * @param retryAttempts 重试次数,默认9次
 * @param retryDelay 重试延迟时间(毫秒),默认3000ms
 * @param dataSourceName 数据源名称,默认'default'
 * @param verboseRetryLog 是否显示详细重试日志,默认false
 * @param toRetry 自定义重试判断函数
 * @returns Observable操作符
 */
export function handleRetry(
  retryAttempts = 9,
  retryDelay = 3000,
  dataSourceName = DEFAULT_DATA_SOURCE_NAME,
  verboseRetryLog = false,
  toRetry?: (err: any) => boolean,
): <T>(source: Observable<T>) => Observable<T> {
  return <T>(source: Observable<T>) =>
    source.pipe(
      retryWhen((e) =>
        e.pipe(
          scan((errorCount, error: Error) => {
            if (toRetry && !toRetry(error)) {
              throw error;
            }
            const dataSourceInfo =
              dataSourceName === DEFAULT_DATA_SOURCE_NAME
                ? ''
                : ` (${dataSourceName})`;
            const verboseMessage = verboseRetryLog
              ? ` Message: ${error.message}.`
              : '';

            logger.error(
              `Unable to connect to the database${dataSourceInfo}.${verboseMessage} Retrying (${
                errorCount + 1
              })...`,
              error.stack,
            );
            if (errorCount + 1 >= retryAttempts) {
              throw error;
            }
            return errorCount + 1;
          }, 0),
          delay(retryDelay),
        ),
      ),
    );
}

/**
 * 获取数据源名称
 *
 * @param options 数据源配置选项
 * @returns 数据源名称
 */
export function getDataSourceName(options: DataSourceOptions): string {
  return options && options.name ? options.name : DEFAULT_DATA_SOURCE_NAME;
}

/**
 * 生成唯一字符串标识符
 *
 * @returns UUID字符串
 */
export const generateString = (): string => uuid();
