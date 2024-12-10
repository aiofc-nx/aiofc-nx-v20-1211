import { ApiProperty } from '@nestjs/swagger';
/**
 * 实体创建冲突数据传输对象
 *
 * @description
 * 该类用于描述实体创建时发生冲突的相关信息:
 * 1. entityName - 发生冲突的实体名称
 * 2. fieldName - 导致冲突的字段名称
 * 3. fieldValue - 导致冲突的字段值
 *
 * @example
 * {
 *   entityName: "User",
 *   fieldName: "email",
 *   fieldValue: "test@example.com"
 * }
 */
export class ConflictEntityCreationData {
  @ApiProperty({
    description: 'name of the entity that was not found',
  })
  entityName!: string;

  @ApiProperty({
    description: 'name of the field that caused the conflict',
  })
  fieldName!: string;

  @ApiProperty({
    description: 'value of the field that caused the conflict',
  })
  fieldValue!: unknown;
}
