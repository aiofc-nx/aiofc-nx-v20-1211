import { Column, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { ClsPreset } from '../subscribers/decorator/cls-preset.decorator';
import { ITenantTrackedBaseEntity, TenantClsStore } from '@aiofc/persistence-base';
import { TrackedTypeormBaseEntity } from './tracked-typeorm-base-entity';

/**
 * 租户可追踪基础实体类
 *
 * 该类通过继承和实现来组合功能:
 * 1. 继承TrackedTypeormBaseEntity:
 *    - 获得可追踪实体的所有功能(创建时间、更新时间、删除时间)
 *
 * 2. 实现ITenantTrackedBaseEntity接口:
 *    - 提供多租户支持
 *    - 添加租户ID字段用于数据隔离
 */
export abstract class TenantTrackedTypeormBaseEntity
  extends TrackedTypeormBaseEntity implements ITenantTrackedBaseEntity
{
  /**
   * 租户ID
   * - @ApiProperty 用于生成Swagger文档
   * - @ClsPreset 通过CLS自动注入租户ID
   * - @Column 定义数据库列,不允许为空
   * - @Index 创建索引提高查询性能
   * - @Expose 控制序列化行为
   */
  @ApiProperty({
    description: 'Tenant identifier',
    type: 'string',
  })
  @ClsPreset<TenantClsStore>({
    clsFieldName: 'tenantId',
  })
  @Column({ nullable: false })
  @Index()
  @Expose()
  tenantId!: string;
}


