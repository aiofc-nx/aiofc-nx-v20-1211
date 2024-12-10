import { BooleanType } from '@aiofc/validation';
import { IsString, IsBoolean } from 'class-validator';

/**
 * 日志配置类
 *
 * @description
 * 定义了日志输出的配置选项:
 * - colorize: 是否启用彩色输出
 * - prettyLogs: 是否美化日志格式
 * - defaultLevel: 默认日志级别
 */
export class LoggerConfig {
  /**
   * 是否启用彩色输出
   *
   * @description
   * 如果为true,日志输出将使用不同颜色区分不同级别
   * 默认为false
   */
  @IsBoolean()
  @BooleanType
  colorize = false;

  /**
   * 是否美化日志格式
   *
   * @description
   * 如果为true,日志将以更易读的格式输出
   * 默认为false
   */
  @IsBoolean()
  @BooleanType
  prettyLogs = false;

  /**
   * 默认日志级别
   *
   * @description
   * 设置日志记录的默认级别
   * 默认为'info'
   */
  @IsString()
  defaultLevel = 'info';
}
