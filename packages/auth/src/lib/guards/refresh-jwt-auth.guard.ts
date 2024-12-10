import { ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ExtractJwt } from 'passport-jwt';
import { TokenService } from '../services/token.service';
import { GeneralUnauthorizedException } from '@aiofc/exceptions';

/**
 * RefreshJwtAuthGuard 守卫
 * 用于验证刷新令牌(Refresh Token)的认证守卫
 *
 * 实现原理:
 * 1. 继承自 AuthGuard('refresh-jwt') 以复用JWT认证功能
 * 2. 通过 TokenService 验证刷新令牌的有效性
 * 3. 重写 canActivate 方法以实现自定义认证逻辑
 * 4. 使用 Logger 记录认证过程中的日志
 *
 * 使用示例:
 * @UseGuards(RefreshJwtAuthGuard)
 * async refreshToken() {
 *   // ...
 * }
 */
@Injectable()
export class RefreshJwtAuthGuard extends AuthGuard('refresh-jwt') {
  private readonly logger = new Logger(RefreshJwtAuthGuard.name);

  constructor(private tokenService: TokenService) {
    super();
  }

  /**
   * 验证刷新令牌是否有效的主要方法
   *
   * 实现流程:
   * 1. 从HTTP请求中提取刷新令牌
   * 2. 如果令牌不存在则:
   *    - 记录警告日志
   *    - 抛出401未授权异常
   * 3. 通过 TokenService 验证令牌有效性
   * 4. 将验证后的用户信息存储到请求对象中
   *
   * @param context ExecutionContext - NestJS执行上下文
   * @returns Promise<boolean> - 返回认证是否通过
   */
  override async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const refreshToken = ExtractJwt.fromAuthHeaderAsBearerToken()(request);

    if (!refreshToken) {
      // guards are called before interceptors, that's why general loggers are not available here
      // in normal situation outside of guards such logs are redundant
      this.logger.warn(`No refresh token found for the request,
      it will be rejected by guard and return 401.`);
      throw new GeneralUnauthorizedException();
    }

    request.user = await this.tokenService.verifyRefreshToken(refreshToken);

    return true;
  }
}
