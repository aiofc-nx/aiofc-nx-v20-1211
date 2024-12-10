import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthConfig } from '../config/auth';
import { IAccessTokenPayload } from '../vo/payload';

/**
 * JWT认证策略
 *
 * 该策略用于验证JWT访问令牌。继承自PassportStrategy,使用passport-jwt策略。
 *
 * 实现原理:
 * 1. 从请求头中提取Bearer token
 * 2. 使用配置的密钥验证token
 * 3. 验证通过后返回payload
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  /**
   * 构造函数
   *
   * @param authConfig - 认证配置,包含token密钥等信息
   *
   * 配置说明:
   * - jwtFromRequest: 从Authorization header提取Bearer token
   * - ignoreExpiration: false表示验证token是否过期
   * - secretOrKey: 用于验证token的密钥
   */
  constructor(private authConfig: AuthConfig) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: authConfig.accessTokenSecret,
    });
  }

  /**
   * 验证token payload
   *
   * @param payload - JWT token解码后的payload
   * @returns 验证通过的payload
   *
   * 该方法在token验证通过后被调用,用于自定义验证逻辑
   * 这里直接返回payload,不做额外验证
   */
  async validate(payload: IAccessTokenPayload): Promise<IAccessTokenPayload> {
    return payload;
  }
}
