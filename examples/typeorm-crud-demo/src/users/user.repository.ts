import { UserProfile } from '@aiofc/entities';
import { InjectDataSource } from '@aiofc/nestjs-typeorm';
import { TrackedTypeormRepository as BaseRepository } from '@aiofc/typeorm-base';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class UserRepository extends BaseRepository<UserProfile, 'id'> {
  constructor(
    @InjectDataSource()
    ds: DataSource
  ) {
    super(UserProfile, ds, 'id');
  }

  async findByIdWithRelations(id: string) {
    const user = await this.findById(id);
    return user;
  }
}
