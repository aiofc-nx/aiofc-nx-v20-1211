import { Injectable } from '@nestjs/common';
import { DbConfig } from './db';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '../core';

/**
 * TypeORM配置服务类
 *
 * @description
 * 该类负责创建和提供TypeORM的配置选项。
 * 实现了TypeOrmOptionsFactory接口,可以被NestJS的依赖注入系统使用。
 *
 * 主要功能:
 * 1. 注入DbConfig配置对象
 * 2. 实现createTypeOrmOptions方法返回TypeORM配置
 */
@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  /**
   * 构造函数
   * @param dbConfig - 数据库配置对象,包含连接信息等
   */
  constructor(private readonly dbConfig: DbConfig) {}

  /**
   * 创建TypeORM配置选项
   * @description
   * 将注入的dbConfig配置对象转换为TypeORM需要的配置格式
   * @returns TypeOrmModuleOptions - TypeORM模块配置选项
   */
  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      ...this.dbConfig,
    } as TypeOrmModuleOptions;
  }
}
