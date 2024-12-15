import { Injectable } from '@nestjs/common';
import { Transactional } from 'typeorm-transactional';
import { IsNull } from 'typeorm';
import { PaginateConfig, Paginated, PaginateQuery } from 'nestjs-paginate';
import { ClassConstructor } from 'class-transformer';
import { BaseEntityService } from '@aiofc/service-base';
import { RoleType, UserRole } from '@aiofc/entities';
import { UserRoleRepository } from '../../repositories/roles/user-role.repository';
import { ClsService, ClsStore } from '@aiofc/nestjs-cls';

@Injectable()
export class UserRoleService extends BaseEntityService<
  UserRole,
  'id',
  UserRoleRepository
> {
  constructor(
    repository: UserRoleRepository,
    private readonly clsService: ClsService<ClsStore>
  ) {
    super(repository);
  }

  // public async archiveOneForTenant(
  //   id: string,
  //   version: number
  // ): Promise<boolean> {
  //   return this.repository
  //     .update(
  //       {
  //         id,
  //         version,
  //         deletedAt: IsNull(),
  //         tenantId: this.clsService.get().tenantId,
  //       },
  //       {
  //         deletedAt: new Date(),
  //       }
  //     )
  //     .then((result) => result.affected === 1);
  // }

  // public async findOneForTenant(id: string) {
  //   return this.findOne({
  //     where: [
  //       {
  //         id,
  //         tenantId: this.clsService.get().tenantId,
  //       },
  //     ],
  //   });
  // }

  // async findAllRolesPaginatedForTenant<T>(
  //   query: PaginateQuery,
  //   config: PaginateConfig<UserRole>,
  //   clazz: ClassConstructor<T>
  // ): Promise<Paginated<T>> {
  //   return this.findAllPaginatedAndTransform(
  //     query,
  //     {
  //       ...config,
  //       where: [
  //         {
  //           tenantId: this.clsService.get().tenantId,
  //         },
  //         {
  //           tenantId: IsNull(),
  //         },
  //       ],
  //     },
  //     clazz
  //   );
  // }

  // @Transactional()
  // async findDefaultUserRole() {
  //   return this.findDefaultRoleByType(RoleType.REGULAR_USER);
  // }

  @Transactional()
  async findDefaultAdminRole() {
    return this.findDefaultRoleByType(RoleType.ADMIN);
  }

  private findDefaultRoleByType(roleType: RoleType) {
    return this.repository.findOne({
      roleType,
      tenantId: IsNull(),
    });
  }
}
