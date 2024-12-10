import { ApiProperty } from '@nestjs/swagger';

/**
 * 错误请求数据传输对象
 *
 * @description
 * 该类用于API文档生成,定义了错误请求的数据结构:
 * 1. property - 导致错误的属性名
 * 2. children - 嵌套对象的错误信息数组
 * 3. constraints - 导致错误的约束条件
 *
 * @example
 * {
 *   property: "email",
 *   children: [],
 *   constraints: {
 *     "isEmail": "email must be a valid email address"
 *   }
 * }
 */
/* istanbul ignore next */
export class BadRequestData {
  @ApiProperty({
    description: '导致错误的属性名',
  })
  property!: string;

  @ApiProperty({
    isArray: true,
    type: BadRequestData,
    description: '嵌套对象的错误信息数组',
  })
  children: BadRequestData[] = [];

  @ApiProperty({
    type: 'object',
    description: '导致错误的约束条件',
    additionalProperties: true,
  })
  constraints!: Record<string, string>;
}
