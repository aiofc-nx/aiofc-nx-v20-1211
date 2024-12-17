import { Injectable, Logger } from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { Transactional } from 'typeorm-transactional';

import { AuthService } from './auth.service';
import { SamlConfig } from '../../../config/saml.config';
import { MissingConfigurationForFeatureException } from '@aiofc/exceptions';
import { InitiateSamlLoginRequest } from '../../controllers/auth/vo/saml.dto';
import { SamlConfigurationService } from '../tenants/saml-configuration.service';
import { RequestWithUser } from '@node-saml/passport-saml/lib/types';
import { SamlStrategy } from '../strategy/saml-strategy';

@Injectable()
export class SamlService {
  private readonly logger = new Logger(SamlService.name);

  constructor(
    private readonly authService: AuthService,
    private readonly samlConfig: SamlConfig,
    private readonly samlConfigService: SamlConfigurationService
  ) {}

  @Transactional()
  async login(
    request: InitiateSamlLoginRequest,
    req: FastifyRequest,
    res: FastifyReply,
    replyData?: Record<string, unknown>
  ) {
    const strategy = await this.createStrategy(
      request.samlConfigurationId,
      req,
      res,
      replyData
    );

    await strategy.authenticate(req as unknown as RequestWithUser, {
      samlFallback: 'login-request',
    });
  }

  /**
   * generate saml xml metadata for a tenant url
   * */
  @Transactional()
  async generateMetadata(
    samlConfigurationId: string,
    request: FastifyRequest,
    res: FastifyReply
  ) {
    const samlConfig = await this.samlConfigService.findById(
      samlConfigurationId
    );
    const mockStrategy = new SamlStrategy(
      this.authService,
      this.samlConfig,
      request,
      res,
      samlConfig.entryPoint,
      samlConfig.certificate,
      {}
    );

    return mockStrategy.generateServiceProviderMetadata(null, null);
  }

  private async createStrategy(
    samlConfigId: string,
    req: FastifyRequest,
    res: FastifyReply,
    replyData?: Record<string, unknown>
  ) {
    const config = await this.samlConfigService.findById(samlConfigId, false);

    if (!config) {
      this.logger.warn(
        `User trying to login with SAML, but tenant config is not found. ${req.hostname}`
      );
      throw new MissingConfigurationForFeatureException('SAML SSO');
    }

    return new SamlStrategy(
      this.authService,
      this.samlConfig,
      req,
      res,
      config.entryPoint,
      config.certificate,
      replyData
    );
  }
}
