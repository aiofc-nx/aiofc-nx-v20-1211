import { Injectable } from '@nestjs/common';
import { SAMLConfiguration } from '@aiofc/entities';
import { SamlConfigurationRepository } from '../../repositories/tenants/saml-configuration.repository';
import { BaseEntityService } from '@aiofc/service-base';

@Injectable()
export class SamlConfigurationService extends BaseEntityService<
  SAMLConfiguration,
  'id',
  SamlConfigurationRepository
> {
  constructor(samlConfigurationService: SamlConfigurationRepository) {
    super(samlConfigurationService);
  }
}
