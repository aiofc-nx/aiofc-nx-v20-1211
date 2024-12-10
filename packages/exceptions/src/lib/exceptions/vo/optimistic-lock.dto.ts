import { ApiProperty } from '@nestjs/swagger';

/**
 * 乐观锁数据传输对象
 *
 * @description
 * 该类用于描述乐观锁冲突时的相关信息:
 * 1. currentVersion - 实体当前的版本号
 *
 * @example
 * {
 *   currentVersion: 1
 * }
 */
export class OptimisticLockData {
  @ApiProperty({
    description: 'The current version of the entity',
  })
  currentVersion!: number;
}
