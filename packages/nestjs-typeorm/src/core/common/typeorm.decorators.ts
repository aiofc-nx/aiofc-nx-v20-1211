import { Inject } from '@nestjs/common';
import { DataSource, DataSourceOptions } from 'typeorm';
import { EntityClassOrSchema } from '../interfaces/entity-class-or-schema.type';
import { DEFAULT_DATA_SOURCE_NAME } from '../typeorm.constants';
import {
  getDataSourceToken,
  getEntityManagerToken,
  getRepositoryToken,
} from './typeorm.utils';

/**
 * TypeORM装饰器集合
 *
 * @description
 * 提供了一组用于依赖注入的装饰器:
 * - InjectRepository: 注入实体的Repository
 * - InjectDataSource: 注入数据源实例
 * - InjectEntityManager: 注入实体管理器
 */

/**
 * 注入实体的Repository装饰器
 *
 * @param entity 要注入Repository的实体类或Schema
 * @param dataSource 数据源名称,默认为DEFAULT_DATA_SOURCE_NAME
 * @returns Inject装饰器
 */
export const InjectRepository = (
  entity: EntityClassOrSchema,
  dataSource: string = DEFAULT_DATA_SOURCE_NAME,
): ReturnType<typeof Inject> => Inject(getRepositoryToken(entity, dataSource));

/**
 * 注入数据源实例的装饰器
 *
 * @param dataSource 数据源配置,可以是DataSource实例、配置对象或数据源名称
 * @returns Inject装饰器
 */
export const InjectDataSource: (
  dataSource?: DataSource | DataSourceOptions | string,
) => ReturnType<typeof Inject> = (
  dataSource?: DataSource | DataSourceOptions | string,
) => Inject(getDataSourceToken(dataSource));

/**
 * @deprecated 已废弃,请使用InjectDataSource替代
 */
export const InjectConnection = InjectDataSource;

/**
 * 注入实体管理器的装饰器
 *
 * @param dataSource 数据源配置,可以是DataSource实例、配置对象或数据源名称
 * @returns Inject装饰器
 */
export const InjectEntityManager: (
  dataSource?: DataSource | DataSourceOptions | string,
) => ReturnType<typeof Inject> = (
  dataSource?: DataSource | DataSourceOptions | string,
) => Inject(getEntityManagerToken(dataSource));
