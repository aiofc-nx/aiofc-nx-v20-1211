import { applyDecorators } from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiExtraModels,
  getSchemaPath,
} from '@nestjs/swagger';
import { ErrorResponse } from '@aiofc/exceptions';

/**
 * Swagger装饰器 - 冲突响应
 *
 * @description
 * 该装饰器用于为API端点添加409冲突响应的Swagger文档:
 * 1. 使用ApiExtraModels注册ErrorResponse模型
 * 2. 使用ApiConflictResponse定义409响应
 * 3. 响应格式继承自ErrorResponse,并固定status为409
 * 4. 支持自定义描述信息
 *
 * @example
 * ```ts
 * @ApiConflictResponsePaginated('实体已存在')
 * async create() {
 *   // ...
 * }
 * ```
 *
 * @todo 考虑将此装饰器移动到更合适的库中
 *
 * @param description - API响应的描述信息
 * @returns 组合装饰器
 */
export const ApiConflictResponsePaginated = (description: string) =>
  applyDecorators(
    ApiExtraModels(ErrorResponse),
    ApiConflictResponse({
      description,
      schema: {
        allOf: [
          { $ref: getSchemaPath(ErrorResponse) }, // 继承ErrorResponse基础结构
          {
            properties: {
              status: {
                type: 'number',
                default: 409, // 固定状态码为409
              },
            },
          },
        ],
      },
    }),
  );
