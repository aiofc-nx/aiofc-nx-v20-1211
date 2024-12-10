import {
  Allow,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import {
  BooleanType,
  IntegerType,
  ValidateNestedProperty,
} from '@aiofc/validation';
import { NamingStrategyInterface } from 'typeorm/naming-strategy/NamingStrategyInterface';
/**
 * 数据库配置相关类
 *
 * 包含三个主要类:
 * - DbSSLExtraConfig: SSL连接配置
 * - DbExtraSettings: 额外数据库设置
 * - DbConfig: 主数据库配置
 */

/**
 * SSL连接配置类
 * 用于配置数据库的SSL连接选项
 */
class DbSSLExtraConfig {
  /**
   * 是否拒绝未经授权的连接
   * 可选布尔值
   */
  @IsBoolean()
  @BooleanType
  @IsOptional()
  rejectUnauthorized?: boolean;

  /**
   * SSL证书相关配置
   * 包含CA证书、私钥、证书文件路径
   */
  @IsString()
  @IsOptional()
  ca?: string; // CA证书路径

  @IsString()
  @IsOptional()
  key?: string; // 私钥路径

  @IsString()
  @IsOptional()
  cert?: string; // 证书文件路径
}

/**
 * 额外的数据库设置类
 * 包含连接池大小和SSL配置
 */
class DbExtraSettings {
  /**
   * 最大连接数
   * 默认值为100
   */
  @IsInt()
  max = 100;

  /**
   * SSL配置对象
   * 可选配置
   */
  @ValidateNestedProperty({ required: false, classType: DbSSLExtraConfig })
  ssl?: DbSSLExtraConfig;
}

/**
 * 主数据库配置类
 * 包含所有数据库连接和行为的配置项
 */
export class DbConfig {
  /**
   * 数据库类型
   * 必填字段
   */
  @IsString()
  type!: string;

  /**
   * 应用名称
   * 必填字段
   */
  @IsString()
  applicationName!: string;

  /**
   * 数据库主机地址
   * 默认为localhost
   */
  @IsString()
  host = 'localhost';

  /**
   * 数据库端口
   * 默认为5432(PostgreSQL默认端口)
   * 取值范围:0-65535
   */
  @IsInt()
  @Min(0)
  @Max(65_535)
  @IntegerType
  port = 5432;

  /**
   * 数据库用户名
   * 必填字段
   */
  @IsString()
  username!: string;

  /**
   * 数据库密码
   * 必填字段
   */
  @IsString()
  password!: string;

  /**
   * 数据库名称
   * 必填字段
   */
  @IsString()
  database!: string;

  /**
   * 是否自动同步数据库结构
   * 默认为false
   */
  @IsBoolean()
  @BooleanType
  synchronize = false;

  /**
   * 是否记录通知日志
   * 默认为true
   */
  @IsBoolean()
  @BooleanType
  logNotifications = true;

  /**
   * 是否自动运行迁移
   * 默认为false
   */
  @IsBoolean()
  @BooleanType
  migrationsRun = false;

  /**
   * 是否删除现有的数据库架构
   * 必须为false
   */
  @IsBoolean()
  @BooleanType
  dropSchema!: false;

  /**
   * 是否保持连接活跃
   * 必须为true
   */
  @IsBoolean()
  @BooleanType
  keepConnectionAlive!: true;

  /**
   * 是否启用SSL连接
   * 默认为false
   */
  @IsBoolean()
  @BooleanType
  ssl = false;

  /**
   * 是否启用日志
   * 必填字段
   */
  @IsBoolean()
  @BooleanType
  logging!: boolean;

  /**
   * 是否自动加载实体
   * 默认为true
   */
  @IsBoolean()
  @BooleanType
  autoLoadEntities = true;

  /**
   * 额外的数据库设置
   * 默认创建新的DbExtraSettings实例
   */
  @ValidateNestedProperty({ required: false, classType: DbExtraSettings })
  extra: DbExtraSettings = new DbExtraSettings();

  /**
   * 命名策略
   * 默认使用SnakeNamingStrategy
   */
  @Allow()
  namingStrategy: NamingStrategyInterface = new SnakeNamingStrategy();

  /**
   * 是否运行种子数据
   * 默认为false
   */
  @IsBoolean()
  @BooleanType
  runSeeds = false;

  /**
   * 是否启用详细的重试日志
   * 默认为false
   */
  @IsBoolean()
  @BooleanType
  verboseRetryLog = false;

  /**
   * 迁移表名称
   * 可选字段
   */
  @IsString()
  @IsOptional()
  migrationsTableName?: string;

  /**
   * 迁移事务模式
   * 可选值:'all' | 'none' | 'each'
   */
  @IsEnum(['all', 'none', 'each'])
  @IsOptional()
  migrationsTransactionMode?: 'all' | 'none' | 'each';

  /**
   * 元数据表名称
   * 可选字段
   */
  @IsString()
  @IsOptional()
  metadataTableName?: string;

  /**
   * 日志记录器类型
   * 可选值:'advanced-console' | 'simple-console' | 'file' | 'debug'
   */
  @IsEnum(['advanced-console', 'simple-console', 'file', 'debug'])
  @IsOptional()
  logger?: 'advanced-console' | 'simple-console' | 'file' | 'debug';

  /**
   * 查询最大执行时间(毫秒)
   * 默认为5000ms
   */
  @IsOptional()
  @IsNumber()
  maxQueryExecutionTime?: number = 5000;

  /**
   * 连接池大小
   * 最小值为1
   * 默认为30
   */
  @IsOptional()
  @Min(1)
  @IsNumber()
  poolSize?: number = 30;
}
