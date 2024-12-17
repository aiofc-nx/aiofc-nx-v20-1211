import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Permission } from '@aiofc/entities';
import { TrackedTypeormRepository as BaseRepository } from '@aiofc/typeorm-base';
import { InjectDataSource } from '@aiofc/nestjs-typeorm';

@Injectable()
export class PermissionRepository extends BaseRepository<Permission, 'id'> {
  constructor(
    @InjectDataSource()
    ds: DataSource
  ) {
    super(Permission, ds, 'id');
  }
}
