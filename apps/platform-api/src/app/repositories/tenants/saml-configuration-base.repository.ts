import { SAMLConfiguration } from '@aiofc/entities';
import { InjectDataSource } from '@aiofc/nestjs-typeorm';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TrackedTypeormRepository as BaseRepository } from '@aiofc/typeorm-base';
@Injectable()
export class SamlConfigurationBaseRepository extends BaseRepository<
  SAMLConfiguration,
  'id'
> {
  constructor(
    @InjectDataSource()
    ds: DataSource
  ) {
    super(SAMLConfiguration, ds, 'id');
  }
}
