import { AuthConfig } from '@aiofc/auth';
import { Injectable } from '@nestjs/common';

/**
 * 认证配置模拟类
 * 继承自 AuthConfig 基类,用于提供认证相关的配置信息
 */
@Injectable()
export class AuthConfigMock extends AuthConfig {
  /**
   * 访问令牌(access token)的密钥
   * 用于签名和验证访问令牌
   */
  override accessTokenSecret =
    'dsNVS7Fdsjb2ZSVI6F3tL8b9T1f9gsUg7XGwWoXC+ZoJ9QZytDZOmr7cZ5FQcNYYT67J6i4K5iKmtyDVZvg1Drb1AEP7enUBf//kMgdy+zMieoYalr12TJmIPjxZgGjom7qUJQRNOTAxz4hyJGdKCbghwxNSEp8GL2arGvPanUbujJd2ExG+ZRkuk89GL9X2WNBTqNV5ItDLtBz8NJhTb48tz+fClJNiGbQzK301gnIeNhIXxFMO6yFWycJB8LFzzWBx4J3kl0pHYfjLbfY4/7amWMLWowj23xKoQSBOkoqFHSDHxPotxK5BVyrLqFsA9FrDROyGcmD2Y2ctryWY8A==';

  /**
   * 访问令牌的过期时间
   * 设置为15分钟
   */
  override accessTokenExpirationTime = '15m';

  /**
   * 刷新令牌(refresh token)的密钥
   * 用于签名和验证刷新令牌
   */
  override refreshTokenSecret =
    'asNVS7Fdsjb2ZSVI6F3tL8b9T1f9gsUg7XGwWoXC+ZoJ9QZytDZOmr7cZ5FQcNYYT67J6i4K5iKmtyDVZvg1Drb1AEP7enUBf//kMgdy+zMieoYalr12TJmIPjxZgGjom7qUJQRNOTAxz4hyJGdKCbghwxNSEp8GL2arGvPanUbujJd2ExG+ZRkuk89GL9X2WNBTqNV5ItDLtBz8NJhTb48tz+fClJNiGbQzK301gnIeNhIXxFMO6yFWycJB8LFzzWBx4J3kl0pHYfjLbfY4/7amWMLWowj23xKoQSBOkoqFHSDHxPotxK5BVyrLqFsA9FrDROyGcmD2Y2ctryWY8A==';

  /**
   * 刷新令牌的过期时间
   * 设置为30天
   */
  override refreshTokenExpirationTime = '30d';
}
