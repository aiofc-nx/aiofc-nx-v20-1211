import { Provider } from '@nestjs/common';
import { DataSource, DataSourceOptions, getMetadataArgsStorage } from 'typeorm';
import { getDataSourceToken, getRepositoryToken } from './common/typeorm.utils';
import { EntityClassOrSchema } from './interfaces/entity-class-or-schema.type';

/**
 * 创建TypeORM提供者函数
 *
 * @description
 * 该函数用于为给定的实体创建TypeORM仓库提供者。
 * 主要功能:
 * 1. 为每个实体创建对应的Repository提供者
 * 2. 根据实体类型返回不同的Repository实例
 * 3. 处理树形实体和MongoDB特殊情况
 *
 * @param entities - 实体类或schema数组
 * @param dataSource - 数据源配置
 * @returns Provider[] - Repository提供者数组
 */
export function createTypeOrmProviders(
  entities?: EntityClassOrSchema[],
  dataSource?: DataSource | DataSourceOptions | string,
): Provider[] {
  return (entities || []).map((entity) => ({
    // 使用实体和数据源生成唯一的注入令牌
    provide: getRepositoryToken(entity, dataSource),

    // 工厂函数,根据实体类型创建对应的Repository
    useFactory: (dataSource: DataSource) => {
      // 获取实体元数据
      const entityMetadata = dataSource.entityMetadatas.find((meta) => meta.target === entity)
      // 判断是否为树形实体
      const isTreeEntity = typeof entityMetadata?.treeType !== 'undefined'

      // 根据实体类型返回对应的Repository
      return isTreeEntity
        ? dataSource.getTreeRepository(entity) // 树形实体
        : dataSource.options.type === 'mongodb'
          ? dataSource.getMongoRepository(entity) // MongoDB实体
          : dataSource.getRepository(entity); // 普通实体
    },

    // 注入数据源
    inject: [getDataSourceToken(dataSource)],

    /**
     * 目标实体Schema
     * 用于解决TypeOrm#forFeature()方法在相同参数下
     * 实体类名相同时的序列化问题
     */
    targetEntitySchema: getMetadataArgsStorage().tables.find(
      (item) => item.target === entity,
    ),
  }));
}
