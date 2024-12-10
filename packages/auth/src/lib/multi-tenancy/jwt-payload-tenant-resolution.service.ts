import { Injectable, Logger } from '@nestjs/common';
import { AbstractTenantResolutionService } from './abstract-tenant-resolution.service';
import { FastifyRequest } from 'fastify';
import { IAccessTokenSingleTenantPayload } from '../vo/payload';
import { GeneralInternalServerException } from '@aiofc/exceptions';

/**
 * JWT载荷租户解析服务
 *
 * 该服务用于从JWT令牌的payload中解析租户ID。
 * 继承自AbstractTenantResolutionService基类，专门处理IAccessTokenSingleTenantPayload类型的payload。
 */
@Injectable()
export class JwtPayloadTenantResolutionService extends AbstractTenantResolutionService<IAccessTokenSingleTenantPayload> {
  /**
   * 创建一个logger实例用于日志记录
   */
  private readonly logger: Logger = new Logger(
    JwtPayloadTenantResolutionService.name,
  );

  /**
   * 从JWT payload中解析租户ID
   *
   * @param _ - FastifyRequest请求对象(未使用)
   * @param jwtPayload - JWT令牌的payload，包含租户信息
   * @returns 解析出的租户ID，如果payload为空则返回undefined
   *
   * 处理逻辑:
   * 1. 如果payload存在，检查其中是否包含tenantId
   * 2. 如果payload存在但没有tenantId，记录错误并抛出异常
   * 3. 如果payload不存在(未授权用户)，返回undefined
   */
  public override async resolveTenantId(
    _: FastifyRequest,
    jwtPayload?: IAccessTokenSingleTenantPayload,
  ): Promise<string | undefined> {
    // jwt payload通常对未授权用户为undefined，因此不需要解析租户
    if (jwtPayload) {
      if (!jwtPayload?.tenantId) {
        this.logger.error(
          {
            jwtPayload,
          },
          `Application is configured to use jwt payload tenant resolution, but tenant id is not in the token, most likely it's some misconfiguration`,
        );
        throw new GeneralInternalServerException();
      }
      return jwtPayload?.tenantId;
    }

    return undefined;
  }

  /**
   * 验证用户是否属于租户
   *
   * @returns 始终返回true，因为租户ID来自JWT payload，已经过验证
   *
   * 说明:
   * 由于租户ID是从已验证的JWT令牌中获取的，因此可以认为用户必定属于该租户
   */
  public override async verifyUserBelongToTenant(): Promise<boolean> {
    return true;
  }
}
