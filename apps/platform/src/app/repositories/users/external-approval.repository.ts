import { ExternalApproval } from '@aiofc/entities';
import { InjectDataSource } from '@aiofc/nestjs-typeorm';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TrackedTypeormRepository as BaseRepository } from '@aiofc/typeorm';

@Injectable()
export class ExternalApprovalsRepository extends BaseRepository<
  ExternalApproval,
  'id'
> {
  constructor(
    @InjectDataSource()
    ds: DataSource
  ) {
    super(ExternalApproval, ds, 'id');
  }
}
