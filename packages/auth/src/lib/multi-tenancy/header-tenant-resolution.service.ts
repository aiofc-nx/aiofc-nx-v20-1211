import { Injectable, Logger } from '@nestjs/common';
import { AuthConfig } from '../config/auth';
import { AbstractTenantResolutionService } from './abstract-tenant-resolution.service';
import { FastifyRequest } from 'fastify';
import { IAccessTokenPayloadWithTenantsInfo } from '../vo/payload';
import { GeneralForbiddenException } from '@aiofc/exceptions';

/**
 * HeaderTenantResolutionService 服务
 * 用于从请求头中解析租户ID并验证用户租户归属
 *
 * 实现原理:
 * 1. 继承 AbstractTenantResolutionService 以实现租户解析接口
 * 2. 从请求头中获取租户ID
 * 3. 通过JWT payload中的租户信息验证用户归属
 * 4. 使用Logger记录可疑的跨租户访问
 *
 * 使用示例:
 * @Inject()
 * private tenantService: HeaderTenantResolutionService;
 *
 * // 解析租户ID
 * const tenantId = await tenantService.resolveTenantId(request);
 *
 * // 验证用户租户归属
 * const isValid = await tenantService.verifyUserBelongToTenant(tenantId, payload);
 */
@Injectable()
export class HeaderTenantResolutionService extends AbstractTenantResolutionService<
  IAccessTokenPayloadWithTenantsInfo<unknown>
> {
  /**
   * 用于记录日志的Logger实例
   */
  private readonly logger = new Logger(HeaderTenantResolutionService.name);

  /**
   * 构造函数,注入AuthConfig配置
   */
  constructor(private config: AuthConfig) {
    super();
  }

  /**
   * 从请求头中解析租户ID
   *
   * @param req FastifyRequest - Fastify请求对象
   * @returns Promise<string | undefined> - 解析出的租户ID
   */
  public override async resolveTenantId(
    req: FastifyRequest,
  ): Promise<string | undefined> {
    return req.headers[this.config.headerTenantId]?.toString();
  }

  /**
   * 验证用户是否属于指定租户
   * 通过检查JWT payload中的租户列表实现
   *
   * @param tenantId string - 租户ID
   * @param jwtPayload IAccessTokenPayloadWithTenantsInfo - JWT载荷数据
   * @returns Promise<boolean> - 用户是否属于该租户
   * @throws GeneralForbiddenException - 当检测到跨租户访问时抛出
   */
  override async verifyUserBelongToTenant(
    tenantId: string,
    jwtPayload: IAccessTokenPayloadWithTenantsInfo<unknown>,
  ): Promise<boolean> {
    const tenantInfo = (jwtPayload.tenants || []).find(
      (t) => t.tenantId === tenantId,
    );

    if (tenantInfo) {
      return true;
    } else {
      this.logger.error(
        {
          tenantId,
          jwtPayload,
        },
        `
        Cross tenant request detected, that is suspicious,
        and it's better to investigate it.
        `,
      );
      throw new GeneralForbiddenException();
    }
  }
}
