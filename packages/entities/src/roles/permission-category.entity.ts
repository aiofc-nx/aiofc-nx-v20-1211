import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  VersionColumn,
} from 'typeorm';
import { Permission } from './permission.entity';
import { Expose } from 'class-transformer';
import {
  IsNumberLocalized,
  IsStringCombinedLocalized,
  IsUUIDLocalized,
} from '@aiofc/validation';
import { TrackedTypeormBaseEntity } from '@aiofc/typeorm-base';

@Entity('permission_categories')
export class PermissionCategory extends TrackedTypeormBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @Expose()
  @IsUUIDLocalized()
  id!: string;

  @Column({ type: String, length: 512, nullable: false })
  @Expose()
  @Index({ unique: true })
  @IsStringCombinedLocalized({
    minLength: 1,
    maxLength: 512,
  })
  name!: string;

  @Column({ type: String, length: 1024, nullable: false })
  @Expose()
  @IsStringCombinedLocalized({
    minLength: 1,
    maxLength: 1024,
  })
  description!: string;

  @OneToMany(
    () => Permission,
    (permission) => permission.permissionCategoryId,
    { eager: false }
  )
  permissions?: Permission[];

  @VersionColumn()
  @IsNumberLocalized()
  @Expose()
  version!: number;
}
