import { DataSource, DataSourceOptions } from 'typeorm';
import { EntityClassOrSchema } from './interfaces/entity-class-or-schema.type';
/**
 * 数据源标识类型
 * 可以是 DataSource 实例、DataSourceOptions 配置对象或字符串
 */
type DataSourceToken = DataSource | DataSourceOptions | string;

/**
 * 实体元数据存储类
 *
 * @description
 * 用于存储和管理不同数据源的实体元数据。
 * 主要功能:
 * 1. 存储每个数据源对应的实体类集合
 * 2. 提供添加和获取实体的方法
 * 3. 防止重复添加相同实体
 */
export class EntitiesMetadataStorage {
  /**
   * 存储数据源和对应实体的Map
   * - key: 数据源名称
   * - value: 实体类数组
   */
  private static readonly storage = new Map<string, EntityClassOrSchema[]>();

  /**
   * 为指定数据源添加实体
   *
   * @param dataSource 数据源标识
   * @param entities 要添加的实体数组
   */
  static addEntitiesByDataSource(
    dataSource: DataSourceToken,
    entities: EntityClassOrSchema[],
  ): void {
    // 获取数据源标识名称
    const dataSourceToken =
      typeof dataSource === 'string' ? dataSource : dataSource.name;
    if (!dataSourceToken) {
      return;
    }

    // 获取或创建实体集合
    let collection = this.storage.get(dataSourceToken);
    if (!collection) {
      collection = [];
      this.storage.set(dataSourceToken, collection);
    }

    // 添加新实体,避免重复
    entities.forEach((entity) => {
      if (collection!.includes(entity)) {
        return;
      }
      collection!.push(entity);
    });
  }

  /**
   * 获取指定数据源的所有实体
   *
   * @param dataSource 数据源标识
   * @returns 实体类数组
   */
  static getEntitiesByDataSource(
    dataSource: DataSourceToken,
  ): EntityClassOrSchema[] {
    // 获取数据源标识名称
    const dataSourceToken =
      typeof dataSource === 'string' ? dataSource : dataSource.name;

    if (!dataSourceToken) {
      return [];
    }
    return this.storage.get(dataSourceToken) || [];
  }
}
