import { Controller, Get, Query, Req, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FastifyReply, FastifyRequest } from 'fastify';
import { SkipAuth } from '@aiofc/auth';
import { GenerateMetadataRequest } from './vo/saml.dto';
import { ClsService } from '@aiofc/nestjs-cls';
import { ClsStore } from '../../../common/vo/cls-store';
import { SamlService } from '../../services/auth/saml.service';

@ApiTags('Auth')
@Controller({
  path: 'auth/saml/sso',
  version: '1',
})
export class SamlController {
  constructor(
    private readonly clsStore: ClsService<ClsStore>,
    private readonly samlService: SamlService
  ) {}

  /**
   * 生成SAML元数据的端点
   *
   * 该方法用于生成SAML服务提供商(SP)的元数据XML。元数据包含了SP的配置信息,
   * 如实体ID、断言消费服务URL等,用于与身份提供商(IdP)建立信任关系。
   *
   * @param req - Fastify请求对象
   * @param res - Fastify响应对象
   * @param request - 包含tenantId和samlConfigurationId的请求参数
   *
   * @returns 返回XML格式的SAML元数据
   */
  @Get('metadata')
  @SkipAuth() // 跳过身份验证,因为这是公开访问的端点
  public async samlMetadata(
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply,
    @Query() request: GenerateMetadataRequest
  ) {
    // 设置当前租户ID到CLS存储中
    this.clsStore.set('tenantId', request.tenantId);

    // 根据SAML配置生成元数据
    const metadata = await this.samlService.generateMetadata(
      request.samlConfigurationId,
      req,
      res
    );

    // 设置响应头为XML类型并返回元数据
    res.header('Content-Type', 'application/xml');
    res.send(metadata);
  }
}
