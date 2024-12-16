import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  VersionColumn,
} from 'typeorm';

import { Tenant } from './tenant.entity';
import {
  IsBooleanLocalized,
  IsNumberLocalized,
  IsStringCombinedLocalized,
  IsUUIDLocalized,
} from '@aiofc/validation';
import { Expose } from 'class-transformer';
import { TrackedTypeormBaseEntity } from '@aiofc/typeorm-base';

/*
此表与Tenants表关联，需要TenantID字段，因此要继承TenantTrackedTypeormBaseEntity
*/
@Entity('saml_configuration')
export class SAMLConfiguration extends TrackedTypeormBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @Expose()
  @IsUUIDLocalized()
  id!: string;

  @Expose()
  @IsUUIDLocalized()
  @Column({ nullable: false })
  tenantId!: string;

  @Expose()
  @IsStringCombinedLocalized({
    minLength: 1,
    maxLength: 2048,
  })
  @Column({ type: String, nullable: false, length: 2048 })
  entryPoint!: string;

  @Expose()
  @IsStringCombinedLocalized({
    minLength: 1,
    maxLength: 16_384,
  })
  @Column({ type: String, nullable: false, length: 16_384 })
  certificate!: string;

  @IsBooleanLocalized()
  @Column({ type: Boolean, nullable: false })
  enabled!: boolean;

  @OneToOne(() => Tenant, {
    eager: false,
  })
  @JoinColumn()
  tenant?: Tenant;

  @VersionColumn()
  @IsNumberLocalized()
  @Expose()
  version!: number;
}
