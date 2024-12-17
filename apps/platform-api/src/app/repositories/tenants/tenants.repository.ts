import { Tenant } from '@aiofc/entities';
import { InjectDataSource } from '@aiofc/nestjs-typeorm';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TrackedTypeormRepository as BaseRepository } from '@aiofc/typeorm-base';
@Injectable()
export class TenantsRepository extends BaseRepository<Tenant, 'id'> {
  constructor(
    @InjectDataSource()
    readonly ds: DataSource
  ) {
    super(Tenant, ds, 'id');
  }
}
