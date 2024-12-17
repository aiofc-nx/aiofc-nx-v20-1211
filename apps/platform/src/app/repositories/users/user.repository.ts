import { UserProfile } from '@aiofc/entities';
import { InjectDataSource } from '@aiofc/nestjs-typeorm';
import { TrackedTypeormRepository as BaseRepository } from '@aiofc/typeorm-base';
import { Injectable } from '@nestjs/common';
import { DataSource, FindOptionsRelations, FindOptionsWhere } from 'typeorm';

@Injectable()
export class UserRepository extends BaseRepository<UserProfile, 'id'> {
  constructor(
    @InjectDataSource()
    ds: DataSource
  ) {
    super(UserProfile, ds, 'id');
  }

  async findOneWithRelations(id: string) {
    const where: FindOptionsWhere<UserProfile> = {
      id,
    };
    const relations: FindOptionsRelations<UserProfile> = {
      userTenantsAccounts: {
        roles: true,
      },
    };

    return this.typeormRepository.findOne({
      where,
      relations,
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
