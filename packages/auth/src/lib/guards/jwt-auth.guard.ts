import { ExecutionContext, Injectable, Logger, Optional } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { ExtractJwt } from 'passport-jwt';
import { firstValueFrom, Observable } from 'rxjs';
import { SKIP_AUTH } from '../vo/constants';
import { TokenService } from '../services/token.service';
import { UserClsStore } from '../vo/user-cls-store';
import { GeneralUnauthorizedException } from '@aiofc/exceptions';
import { IAccessTokenPayload } from '../vo/payload';
import { AbstractTenantResolutionService } from '../multi-tenancy/abstract-tenant-resolution.service';
import { ClsService } from '@aiofc/nestjs-cls';

/**
 * JwtAuthGuard 守卫
 * 用于验证JWT令牌的认证守卫
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(
    private tokenService: TokenService,
    private clsService: ClsService<UserClsStore<IAccessTokenPayload>>,
    private reflector: Reflector,
    @Optional()
    private abstractTenantResolution?: AbstractTenantResolutionService<IAccessTokenPayload>,
  ) {
    super();
  }


  /**
   * 验证JWT令牌是否有效的主要方法
   *
   * 实现流程:
   * 1. 检查是否跳过认证
   * 2. 获取HTTP请求对象
   * 3. 如果跳过认证:
   *    - 仅解析租户ID并存储到CLS中
   *    - 直接返回true
   * 4. 否则执行完整认证流程:
   *    - 从请求头提取JWT令牌
   *    - 如果令牌不存在则抛出401错误
   *    - 验证令牌有效性获取payload
   *    - 解析租户ID
   *    - 验证用户是否属于该租户
   *    - 将用户信息存储到CLS中
   * 5. 调用父类canActivate完成认证
   *
   * @param context ExecutionContext - NestJS执行上下文
   * @returns Promise<boolean> - 返回认证是否通过
   */
  override async canActivate(context: ExecutionContext): Promise<boolean> {
    const skipAuth = this.reflector.getAllAndOverride<boolean>(SKIP_AUTH, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();

    if (skipAuth) {
      const tenantId =
        await this.abstractTenantResolution?.resolveTenantId(request);
      this.clsService.set('tenantId', tenantId);
      return true;
    }

    const accessToken = ExtractJwt.fromAuthHeaderAsBearerToken()(request);

    if (!accessToken) {
      // guards are called before interceptors, that's why general loggers are not available here
      // in normal situation outside of guards such logs are redundant
      this.logger.log(`No access token found for the request,
      it will be rejected by guard and return 401.`);
      throw new GeneralUnauthorizedException();
    }

    const payload = await this.tokenService.verifyAccessToken(accessToken);
    const tenantId = await this.abstractTenantResolution?.resolveTenantId(
      request,
      payload,
    );

    if (tenantId !== undefined) {
      await this.abstractTenantResolution?.verifyUserBelongToTenant(
        tenantId,
        payload,
      );
    }

    this.clsService.set('jwtPayload', payload);
    this.clsService.set('userId', payload.sub);
    this.clsService.set('authHeader', accessToken);
    this.clsService.set('tenantId', tenantId);

    const result = await super.canActivate(context);

    /* istanbul ignore next */
    return result instanceof Observable ? firstValueFrom(result) : result;
  }
}
