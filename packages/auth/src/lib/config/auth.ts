import { IsOptional, IsString } from 'class-validator';

/**
 * 认证配置类
 *
 * 该类定义了系统认证相关的配置参数,包括:
 * - JWT访问令牌和刷新令牌的密钥及过期时间
 * - HTTP请求头中认证和租户信息的字段名
 */
export class AuthConfig {
  /**
   * JWT访问令牌密钥
   * 用于签名和验证访问令牌
   */
  @IsString()
  accessTokenSecret!: string;

  /**
   * JWT访问令牌过期时间
   * 定义访问令牌的有效期
   */
  @IsString()
  accessTokenExpirationTime!: string;

  /**
   * JWT刷新令牌密钥
   * 用于签名和验证刷新令牌
   */
  @IsString()
  refreshTokenSecret!: string;

  /**
   * JWT刷新令牌过期时间
   * 定义刷新令牌的有效期
   */
  @IsString()
  refreshTokenExpirationTime!: string;

  /**
   * 认证请求头名称
   * 默认为'authorization',用于携带JWT令牌
   */
  @IsString()
  authHeaderName = 'authorization';

  /**
   * 租户ID请求头名称
   * 默认为'x-tenant-id',用于多租户系统中标识租户
   */
  @IsString()
  @IsOptional()
  headerTenantId = 'x-tenant-id';
}
