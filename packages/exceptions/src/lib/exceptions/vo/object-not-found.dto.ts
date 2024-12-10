import { ApiProperty } from '@nestjs/swagger';

/**
 * 未找到对象数据传输对象
 *
 * @description
 * 该类用于描述未找到对象时的相关信息:
 * 1. entityName - 未找到的实体名称
 *
 * @example
 * {
 *   entityName: "User"
 * }
 */
export class ObjectNotFoundData {
  @ApiProperty({
    description: 'name of the entity that was not found',
  })
  entityName!: string;
}
