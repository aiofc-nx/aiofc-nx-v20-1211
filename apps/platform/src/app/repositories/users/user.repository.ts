import { UserProfile } from '@aiofc/entities';
import { InjectDataSource } from '@aiofc/nestjs-typeorm';
import { TrackedTypeormRepository as BaseRepository } from '@aiofc/typeorm-base';
import { Injectable } from '@nestjs/common';
import { DataSource, FindOptionsWhere } from 'typeorm';

@Injectable()
export class UserRepository extends BaseRepository<UserProfile, 'id'> {
  constructor(
    @InjectDataSource()
    ds: DataSource
  ) {
    super(UserProfile, ds, 'id');
  }

  async findByIdWithRelations(relations: string[], id: string) {
    const where: FindOptionsWhere<UserProfile> = {
      id,
    };

    return this.typeormRepository.findOne({
      where,
      relations: {
        userTenantsAccounts: {
          roles: true,
        },
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        userTenantsAccounts: {
          id: true,
          tenantId: true,
          userStatus: true,
          roles: {
            id: true,
            name: true,
          },
        },
      },
    });
  }
}
