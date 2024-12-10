import {
  IsEmail,
  IsOptional,
  IsString,
  IsUrl,
  Allow,
  IsBoolean,
} from 'class-validator';
import { BooleanType } from '@aiofc/validation';
/**
 * Swagger配置类
 *
 * @description
 * 用于配置Swagger API文档的相关信息:
 * - 基本信息:标题、描述、版本号等
 * - 联系人信息:姓名、邮箱、URL
 * - 服务器配置:支持配置多个服务器环境
 */
export class SwaggerConfig {
  /**
   * API文档标题
   */
  @IsString()
  title!: string;

  /**
   * 是否启用Swagger
   * @default false
   */
  @BooleanType
  @IsBoolean()
  enabled = false;

  /**
   * Swagger UI访问路径
   */
  @IsString()
  swaggerPath!: string;

  /**
   * API文档描述信息
   */
  @IsString()
  description!: string;

  /**
   * API版本号
   */
  @IsString()
  version!: string;

  /**
   * 联系人姓名
   */
  @IsString()
  contactName!: string;

  /**
   * 联系人邮箱
   */
  @IsEmail()
  contactEmail!: string;

  /**
   * 联系人URL
   */
  @IsUrl()
  contactUrl!: string;

  /**
   * 服务器配置列表
   * @optional
   */
  @Allow()
  @IsOptional()
  servers?: Server[];
}

/**
 * 服务器配置类
 *
 * @description
 * 用于配置API服务器环境信息:
 * - url: 服务器地址
 * - description: 环境说明
 */
export class Server {
  /**
   * 服务器URL
   */
  @IsString()
  url!: string;

  /**
   * 服务器描述
   */
  @IsString()
  description!: string;
}
