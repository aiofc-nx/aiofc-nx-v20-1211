import {
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ITrackedBaseEntity } from '@aiofc/persistence-base';
import { TypeormBaseEntity } from './typeorm-base-entity';



/**
 * TypeORM可追踪基础实体类
 *
 * 该类通过继承和实现来组合功能:
 * 1. 继承TypeormBaseEntity:
 *    - 获得TypeORM基础实体的所有功能
 *
 * 2. 实现ITrackedBaseEntity接口:
 *    - 提供实体的追踪功能
 *    - 包含创建时间、更新时间、删除时间等字段
 */
export abstract class TrackedTypeormBaseEntity extends TypeormBaseEntity implements ITrackedBaseEntity
{
  /**
   * 创建时间
   * - 使用@CreateDateColumn装饰器自动设置创建时间
   * - 通过@Expose装饰器控制序列化行为
   * - 使用@ApiProperty装饰器生成Swagger文档
   */
  @ApiProperty({
    type: Date,
    description: 'Created at date time in ISO format',
  })
  @Expose({
    toPlainOnly: true,
  })
  @CreateDateColumn()
  createdAt!: Date;

  /**
   * 更新时间
   * - 使用@UpdateDateColumn装饰器自动更新时间
   * - 每次实体更新时自动更新此字段
   */
  @ApiProperty({
    type: Date,
    description: 'Last time updated at date time in ISO format',
  })
  @Expose({
    toPlainOnly: true,
  })
  @UpdateDateColumn()
  updatedAt!: Date;

  /**
   * 删除时间
   * - 使用@DeleteDateColumn实现软删除
   * - 当实体被"删除"时,实际上是设置此字段
   * - 可选字段,未删除时为null
   */
  @ApiProperty({
    type: Date,
    description: 'Deleted at date time in ISO format',
  })
  @Expose({
    toPlainOnly: true,
  })
  @DeleteDateColumn()
  deletedAt?: Date;
}
