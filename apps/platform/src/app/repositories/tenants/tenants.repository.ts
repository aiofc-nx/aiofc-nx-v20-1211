import { Tenant } from '@aiofc/entities';
import { InjectDataSource } from '@aiofc/nestjs-typeorm';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TenantTrackedTypeormRepository as BaseRepository } from '@aiofc/typeorm';
import { ClsService } from '@aiofc/nestjs-cls';
import { TenantClsStore } from '@aiofc/persistence-base';
@Injectable()
export class TenantsRepository extends BaseRepository<Tenant, 'id'> {
  constructor(
    @InjectDataSource()
    readonly ds: DataSource,
    protected readonly clsService: ClsService<TenantClsStore>
  ) {
    super(Tenant, ds, 'id', clsService);
  }
}
