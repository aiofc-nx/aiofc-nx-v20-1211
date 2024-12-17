import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { SAMLConfiguration } from '@aiofc/entities';
import { InjectDataSource } from '@aiofc/nestjs-typeorm';
import { ClsService } from '@aiofc/nestjs-cls';
import { TenantClsStore } from '@aiofc/persistence-base';
import { TenantTrackedTypeormRepository as BaseRepository } from '@aiofc/typeorm-base';

@Injectable()
export class SamlConfigurationRepository extends BaseRepository<
  SAMLConfiguration,
  'id'
> {
  constructor(
    @InjectDataSource()
    ds: DataSource,
    clsService: ClsService<TenantClsStore>
  ) {
    super(SAMLConfiguration, ds, 'id', clsService);
  }
}
