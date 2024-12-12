import { ValidateNestedProperty } from '@aiofc/config';
import { AppConfig } from '@aiofc/fastify-server';
import { LoggerConfig } from '@aiofc/logger';
import { I18Config } from '@aiofc/i18n';
import { DbConfig } from '@aiofc/nestjs-typeorm';
import { SwaggerConfig } from '@aiofc/swagger-utils';
import { SamlConfig } from './saml.config';

/**
 * 根配置类
 *
 * @description
 * 该类集中管理所有配置模块:
 *
 * 1. app - 应用程序配置
 * - 使用AppConfig类型
 * - 包含应用基本配置如端口、主机等
 *
 * 2. logger - 日志配置
 * - 使用LoggerConfig类型
 * - 配置日志记录行为
 *
 * 3. i18 - 国际化配置
 * - 使用I18Config类型
 * - 管理多语言支持
 *
 * 4. db - 数据库配置
 * - 使用DbConfig类型
 * - 配置数据库连接参数
 *
 * 5. swagger - API文档配置
 * - 使用SwaggerConfig类型
 * - 配置Swagger文档生成
 *
 * 6. saml - SAML认证配置
 * - 使用SamlConfig类型
 * - 配置SAML单点登录
 *
 * 所有配置属性都:
 * - 使用@ValidateNestedProperty装饰器进行验证
 * - 被标记为只读(readonly)
 * - 使用非空断言(!)表示必须配置
 */
export default class RootConfig {
  @ValidateNestedProperty({ classType: AppConfig })
  public readonly app!: AppConfig;

  @ValidateNestedProperty({ classType: LoggerConfig })
  public readonly logger!: LoggerConfig;

  @ValidateNestedProperty({ classType: I18Config })
  public readonly i18!: I18Config;

  @ValidateNestedProperty({ classType: DbConfig })
  public readonly db!: DbConfig;

  @ValidateNestedProperty({ classType: SwaggerConfig })
  public readonly swagger!: SwaggerConfig;

  @ValidateNestedProperty({ classType: SamlConfig })
  public readonly saml!: SamlConfig;
}
