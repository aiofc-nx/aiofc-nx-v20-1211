import { ApiProperty } from '@nestjs/swagger';

/**
 * 错误响应数据传输对象
 *
 * @description
 * 遵循 RFC 7807 规范的错误响应格式。
 * 该类定义了一个标准化的错误响应结构,包含以下字段:
 * 1. type - 错误文档链接,指向详细说明文档
 * 2. title - 错误标题,简短描述
 * 3. status - HTTP状态码
 * 4. detail - 详细错误信息
 * 5. data - 附加错误数据(可选)
 * 6. instance - 错误实例标识符
 * 7. errorCode - 错误代码(可选)
 *
 * @link https://www.rfc-editor.org/rfc/rfc7807
 *
 * @example
 * {
 *   type: "https://api.example.com/errors/not-found",
 *   title: "Resource Not Found",
 *   status: 404,
 *   detail: "Customer with id 12344321 not found",
 *   instance: "urn:uuid:12345678-1234-1234-1234-123456789012",
 *   errorCode: "CUSTOMER_NOT_FOUND"
 * }
 */
export class ErrorResponse<ADDITIONAL_DATA extends object = object> {
  @ApiProperty({
    description: '错误文档链接,指向包含更多错误详情的文档',
    required: true,
  })
  type!: string;

  @ApiProperty({
    description: '错误标题,简短的错误描述',
  })
  title!: string;

  @ApiProperty({
    description: 'HTTP状态码,例如404',
  })
  status!: number;

  @ApiProperty({
    description: '详细的错误信息,面向最终用户的完整描述(例如:"未找到ID为12344321的客户")',
  })
  detail!: string;

  @ApiProperty({
    description: '客户端可用于处理错误的附加数据',
  })
  data?: ADDITIONAL_DATA | ADDITIONAL_DATA[];

  @ApiProperty({
    description: '错误实例,此次具体错误发生的唯一标识符',
  })
  instance!: string;

  @ApiProperty({
    description: '唯一标识错误或问题类型的代码',
  })
  errorCode?: string;
}
