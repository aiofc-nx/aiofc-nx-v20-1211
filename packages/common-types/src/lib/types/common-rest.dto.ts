import { ApiProperty } from '@nestjs/swagger';
import {
  IsUUIDLocalized,
  IsIntegerStringCombinedLocalized,
  IsNotEmptyLocalized,
} from '@aiofc/validation';
/**
 * 通用REST DTO类型定义
 */

/**
 * 创建实体后的简单响应类
 *
 * @description
 * 用于创建实体后返回响应信息:
 * - message: 用户友好的提示信息
 * - data.id: 新创建实体的ID
 *
 * @template ID - 实体ID类型参数
 */
export class SimpleResponseForCreatedEntityWithMessage<ID> {
  @ApiProperty({
    description:
      'General friendly message that can be shown to the user, about entity creation',
  })
  message!: string;
  data!: {
    id: ID;
  };
}

/**
 * UUID格式的ID参数类
 *
 * @description
 * 用于接收UUID格式的实体ID参数:
 * - 使用@IsUUIDLocalized()验证是否为有效的UUID
 * - 提供Swagger文档
 */
export class IdParamUUID {
  @ApiProperty({
    description: 'Entity id, uuid v4 format',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: true,
  })
  @IsUUIDLocalized()
  id!: string;
}

/**
 * 版本号参数类
 *
 * @description
 * 用于接收实体版本号参数:
 * - 使用@IsNotEmptyLocalized()验证非空
 * - 使用@IsIntegerStringCombinedLocalized()验证为大于等于0的整数
 * - 提供Swagger文档
 */
export class VersionNumberParam {
  @ApiProperty({
    description: 'Version number of entity',
    example: '1',
    minimum: 0,
    required: true,
  })
  @IsNotEmptyLocalized()
  @IsIntegerStringCombinedLocalized({
    min: 0,
  })
  version!: number;
}
