import { IncomingMessage, ServerResponse } from 'node:http';

import { LoggerConfig } from './config/logger';
import { DynamicModule } from '@nestjs/common';
import { LoggerModule } from './core/LoggerModule';
import { ClsService, ClsStore } from '@aiofc/nestjs-cls';
/**
 * 创建异步日志模块的工厂函数
 *
 * @description
 * 该函数用于创建一个异步的日志模块,支持自定义请求日志属性和CLS服务集成:
 * - 支持自定义日志格式和属性
 * - 集成了HTTP请求日志记录
 * - 支持通过CLS服务传递上下文
 *
 * @param customProps 自定义属性函数,用于添加额外的日志字段
 * @returns NestJS动态模块
 */
export function loggerModuleForRootAsync<ClsType extends ClsStore>(
  customProps: (
    req: IncomingMessage,
    res: ServerResponse<IncomingMessage>,
    clsService?: ClsService<ClsType>,
  ) => Record<string, string> = () => ({}),
):DynamicModule {
  return LoggerModule.forRootAsync({
    useFactory: async (
      loggerConfig: LoggerConfig,
      clsService?: ClsService<ClsType>,
    ) => {
      return {
        renameContext: 'class',
        pinoHttp: {
          /**
           * 格式化日志级别
           */
          formatters: {
            level: (label) => {
              return { level: label };
            },
          },

          /**
           * 添加自定义属性到日志
           */
          customProps: (req, res) => {
            return customProps(req, res, clsService);
          },

          /**
           * 自定义成功响应日志对象
           */
          customSuccessObject: (
            req: IncomingMessage,
            res: ServerResponse,
            val: any,
          ) => {
            return {
              reqId: req.id,
              responseTime: val.responseTime,
            };
          },

          /**
           * 自定义请求序列化
           */
          serializers: {
            req: (req) => ({
              method: req.method,
              url: req.url,
            }),
          },

          /**
           * 自定义错误响应日志对象
           */
          customErrorObject: (
            req: IncomingMessage,
            res: ServerResponse,
            error: Error,
            val: any,
          ) => {
            return {
              statusMessage: res.statusMessage,
              statusCode: res.statusCode,
              err: val.err,
            };
          },

          /**
           * 自定义接收请求时的日志消息
           */
          customReceivedMessage: (req: IncomingMessage) => {
            return `Call Endpoint: ${req.method} ${req.url}`;
          },

          /**
           * 自定义成功响应时的日志消息
           */
          customSuccessMessage: (
            req: IncomingMessage,
            res: ServerResponse,
            responseTime: number,
          ) => {
            return `Finished Endpoint: ${req.method} ${req.url} for ${responseTime}ms`;
          },

          /**
           * 自定义错误响应时的日志消息
           */
          customErrorMessage: (
            req: IncomingMessage,
            res: ServerResponse,
            error: Error,
          ) => {
            return `Failed Endpoint: ${req.method} ${req.url} Error - ${error.message}.`;
          },

          /**
           * 根据响应状态码自定义日志级别
           */
          customLogLevel: function (req, res, err) {
            if (res.statusCode >= 400 && res.statusCode < 500) {
              return 'info';
            } else if (res.statusCode >= 500 || err) {
              return 'error';
            } else if (res.statusCode >= 300 && res.statusCode < 400) {
              return 'silent';
            }
            return 'info';
          },

          // 禁用默认的请求日志记录器
          quietReqLogger: true,
          // 启用自动日志记录
          autoLogging: true,
          // 使用配置的默认日志级别
          level: loggerConfig.defaultLevel,
          // 配置日志传输方式,支持美化输出
          transport: loggerConfig.prettyLogs
            ? { target: 'pino-pretty',
              options: {
                colorize: loggerConfig.colorize,
                // ignore: 'pid,hostname',
              },
             }
            : undefined,
        },
      };
    },
    // 注入依赖
    inject: [LoggerConfig, { token: ClsService, optional: true }],
    providers: [],
  });
}
