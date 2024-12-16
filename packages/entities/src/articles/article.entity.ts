import { TrackedTypeormBaseEntity } from '@aiofc/typeorm-base';
import {
  IsNumberLocalized,
  IsStringCombinedLocalized,
  IsUUIDLocalized,
} from '@aiofc/validation';
import { Expose } from 'class-transformer';
import { Entity, PrimaryGeneratedColumn, Column, VersionColumn } from 'typeorm';

@Entity('articles')
export class Article extends TrackedTypeormBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @Expose()
  @IsUUIDLocalized()
  id!: string;

  @Column({ type: String, nullable: false, length: 256 })
  @Expose()
  @IsStringCombinedLocalized({ minLength: 1, maxLength: 256 })
  title!: string;

  @Column({ type: 'varchar', nullable: true })
  @Expose()
  author?: string;

  @Column({ type: String, length: 1024, nullable: false })
  @Expose()
  @IsStringCombinedLocalized({
    minLength: 1,
    maxLength: 1024,
  })
  description!: string;

  /**
   * 版本号
   * 用于实现乐观锁控制
   */
  @VersionColumn()
  @IsNumberLocalized()
  @Expose()
  version!: number;
}
