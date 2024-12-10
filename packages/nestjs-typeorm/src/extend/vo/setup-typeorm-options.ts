import { Type } from '@nestjs/common';
import { MixedList } from 'typeorm';
import { TypeOrmOptionsFactory } from '../../core';
import { TypeOrmConfigService } from '../../config/typeorm-config.service';

/**
 * TypeORM设置选项接口
 * 用于配置TypeORM的初始化选项
 */
export interface SetupTypeormOptions {
  /**
   * TypeORM配置工厂类
   * 可选参数,用于创建TypeORM连接配置
   */
  optionsFactory?: Type<TypeOrmOptionsFactory>;

  /**
   * 数据库迁移文件列表
   * 可选参数,用于执行数据库迁移
   */
  migrations?: MixedList<Function>;
}

/**
 * TypeORM设置的默认选项
 * 使用TypeOrmConfigService作为默认配置工厂
 * 默认迁移列表为空
 */
export const DEFAULT_SETUP_TYPEORM_OPTIONS: SetupTypeormOptions = {
  optionsFactory: TypeOrmConfigService,
  migrations: [],
};
