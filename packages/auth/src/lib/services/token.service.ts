import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthConfig } from '../config/auth';
import {
  IAccessTokenPayload,
  IRefreshTokenPayload,
  PayloadSigned,
} from '../vo/payload';
import { GeneralUnauthorizedException } from '@aiofc/exceptions';

/**
 * 令牌服务
 *
 * 该服务负责JWT令牌的签发和验证。使用泛型支持自定义令牌载荷类型:
 * - ACCESS_TOKEN_TYPE: 访问令牌载荷类型,继承自IAccessTokenPayload
 * - REFRESH_TOKEN_TYPE: 刷新令牌载荷类型,继承自IRefreshTokenPayload
 *
 * 实现原理:
 * 1. 提供令牌签发功能,包括访问令牌和刷新令牌
 * 2. 提供令牌验证功能
 * 3. 检查令牌长度,避免过大
 */
@Injectable()
export class TokenService<
  ACCESS_TOKEN_TYPE extends IAccessTokenPayload = IAccessTokenPayload,
  REFRESH_TOKEN_TYPE extends IRefreshTokenPayload = IRefreshTokenPayload,
> {
  private readonly logger = new Logger(TokenService.name);

  constructor(
    private readonly authConfig: AuthConfig,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * 签发访问令牌和刷新令牌
   *
   * @param accessTokenPayload - 访问令牌载荷
   * @param refreshTokenPayload - 刷新令牌载荷
   * @returns 包含访问令牌和刷新令牌的对象
   *
   * 处理流程:
   * 1. 记录日志
   * 2. 并行签发两种令牌
   * 3. 检查令牌长度
   * 4. 返回令牌对象
   */
  async signTokens({
    accessTokenPayload,
    refreshTokenPayload,
  }: {
    accessTokenPayload: ACCESS_TOKEN_TYPE;
    refreshTokenPayload: REFRESH_TOKEN_TYPE;
  }) {
    this.logger.log(`Generating tokens for user: ${accessTokenPayload.email}}`);

    const [accessToken, refreshToken] = await Promise.all([
      this.signAccessToken(accessTokenPayload),
      this.signRefreshToken(refreshTokenPayload),
    ]);

    await this.checkTokenLength(accessToken);
    await this.checkTokenLength(refreshToken);

    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }

  /**
   * 签发刷新令牌
   *
   * @param jwtPayload - 刷新令牌载荷
   * @returns 签发的刷新令牌字符串
   */
  private async signRefreshToken(jwtPayload: REFRESH_TOKEN_TYPE) {
    return this.jwtService.signAsync(jwtPayload, {
      secret: this.authConfig.refreshTokenSecret,
      expiresIn: this.authConfig.refreshTokenExpirationTime,
    });
  }

  /**
   * 签发访问令牌
   *
   * @param jwtPayload - 访问令牌载荷
   * @returns 签发的访问令牌字符串
   */
  async signAccessToken(jwtPayload: ACCESS_TOKEN_TYPE) {
    return this.jwtService.signAsync(jwtPayload, {
      secret: this.authConfig.accessTokenSecret,
      expiresIn: this.authConfig.accessTokenExpirationTime,
    });
  }

  /**
   * 验证访问令牌
   *
   * @param token - 访问令牌字符串
   * @returns 验证后的令牌载荷
   */
  async verifyAccessToken(
    token: string,
  ): Promise<IAccessTokenPayload & PayloadSigned> {
    return this.verifyToken(token, this.authConfig.accessTokenSecret);
  }

  /**
   * 验证刷新令牌
   *
   * @param token - 刷新令牌字符串
   * @returns 验证后的令牌载荷
   */
  async verifyRefreshToken(
    token: string,
  ): Promise<IRefreshTokenPayload & PayloadSigned> {
    return this.verifyToken(token, this.authConfig.refreshTokenSecret);
  }

  /**
   * 验证令牌
   *
   * @param token - 令牌字符串
   * @param secret - 密钥
   * @returns 验证后的令牌载荷
   * @throws GeneralUnauthorizedException - 当验证失败时抛出
   */
  private verifyToken(token: string, secret: string) {
    try {
      return this.jwtService.verify(token, {
        secret,
      });
    } catch (error) {
      throw new GeneralUnauthorizedException(undefined, error);
    }
  }

  /**
   * 检查令牌长度
   *
   * @param token - 令牌字符串
   *
   * 如果令牌长度超过7kb,记录错误日志。
   * 过长的令牌可能导致性能问题。
   */
  private async checkTokenLength(token: string) {
    if (Buffer.byteLength(token, 'utf8') > 7168) {
      this.logger.error(
        `Token length is greater than 7kb, length: ${token.length}. This shouldn't happen in production and may become a big issue.`,
      );
    }
  }
}
