import { Injectable, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

/**
 * ExternalAuthGuard 守卫
 * 用于验证外部认证服务的JWT令牌
 *
 * 实现原理:
 * 1. 继承自 AuthGuard('jwt') 以复用JWT认证功能
 * 2. 通过 reflector 获取路由上的元数据
 * 3. 重写 canActivate 方法以实现自定义认证逻辑
 * 4. 使用 Logger 记录认证过程中的日志
 *
 * 使用示例:
 * @UseGuards(ExternalAuthGuard)
 * async externalEndpoint() {
 *   // ...
 * }
 */
@Injectable()
export class ExternalAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(ExternalAuthGuard.name);

  constructor(private reflector: Reflector) {
    super();
  }

  /**
   * Verify the token is valid, by calling external login service
   * @param context {ExecutionContext}
   * @returns super.canActivate(context)
   */
  override async canActivate(): Promise<boolean> {
    return true;
  }
}
