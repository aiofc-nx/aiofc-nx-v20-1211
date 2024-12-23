import {
  Column,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  VersionColumn,
} from 'typeorm';

import { UserProfile } from './user-profile.entity';
import { Tenant } from '../tenants/tenant.entity';
import { UserRole } from '../roles/user-role.entity';
import { UserAccountStatus } from './types/user-account-status.enum';
import { Expose } from 'class-transformer';
import {
  IsNumberLocalized,
  IsStringEnumLocalized,
  IsUUIDLocalized,
} from '@aiofc/validation';
import { TrackedTypeormBaseEntity } from '@aiofc/typeorm-base';

@Entity('user_tenant_accounts')
@Index(['tenantId', 'userProfileId'])
@Index(['tenantId', 'createdAt'])
export class UserTenantAccount extends TrackedTypeormBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @Expose()
  @IsUUIDLocalized()
  id!: string;

  @Expose()
  @IsUUIDLocalized()
  @Column({ nullable: false })
  tenantId!: string;

  @Expose()
  @IsUUIDLocalized()
  @Column({ nullable: false })
  userProfileId!: string;

  @Column({
    type: 'enum',
    enum: UserAccountStatus,
    nullable: false,
  })
  @Expose()
  @IsStringEnumLocalized(UserAccountStatus)
  userStatus!: UserAccountStatus;

  @ManyToMany(() => UserRole, { cascade: true, eager: false })
  @JoinTable({
    name: 'users_roles',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles?: UserRole[];

  @ManyToOne(() => UserProfile, (user) => user.userTenantsAccounts, {
    eager: false,
    cascade: false,
  })
  userProfile?: UserProfile;

  @ManyToOne(() => Tenant, (tenant) => tenant.tenantUsersAccount, {
    eager: false,
    cascade: false,
  })
  tenant?: Tenant;

  @VersionColumn()
  @IsNumberLocalized()
  @Expose()
  version!: number;
}
