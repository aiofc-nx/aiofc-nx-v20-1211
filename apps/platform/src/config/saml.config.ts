import { Allow, IsBoolean, IsString } from 'class-validator';

/**
 * SAML配置类
 * 用于定义SAML身份验证所需的配置参数
 */
export class SamlConfig {
  /**
   * SAML身份提供者(IdP)的标识符
   * 必填字符串类型
   */
  @IsString()
  issuer!: string;

  /**
   * 是否要求签名断言
   * 必填布尔类型,用于增强安全性
   */
  @IsBoolean()
  wantAssertionsSigned!: boolean;

  /**
   * 前端URL
   * 可选字符串类型
   * 用于指定前端应用的URL
   */
  @IsString()
  @Allow()
  frontendUrl?: string;

  /**
   * 回调URL
   * 必填字符串类型
   * SAML认证完成后的回调地址
   */
  @IsString()
  callbackUrl!: string;
}
