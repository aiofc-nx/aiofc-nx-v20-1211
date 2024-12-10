import { ROOT_CONFIG_ALIAS_TOKEN } from './constants';
import { SetupConfigOptions } from './vo/setup-config-options';
import { getExistingFilePaths } from './utils/get-existing-file-paths';
import type { DynamicModule, Type } from '@nestjs/common';
import { fileLoader, TypedConfigModule } from '../core';

/**
 * 创建类型化配置模块的根模块
 *
 * @description
 * 该函数用于创建和配置 TypedConfigModule:
 * 1. 获取配置文件路径
 * - 使用 getExistingFilePaths 获取所有存在的配置文件路径
 * - 支持自定义文件夹名称、基础文件名和环境配置
 *
 * 2. 创建动态模块
 * - 使用 TypedConfigModule.forRoot 创建基础模块
 * - 配置 schema 用于验证
 * - 设置为全局模块
 * - 加载所有配置文件
 *
 * 3. 扩展动态模块
 * - 添加 ROOT_CONFIG_ALIAS_TOKEN provider
 * - 导出根配置类和别名令牌
 *
 * @param baseDir - 基础目录路径
 * @param rootSchemaClass - 根配置类
 * @param options - 配置选项
 * @returns NestJS 动态模块
 */
export function typedConfigModuleForRoot(
  baseDir: string,
  rootSchemaClass: Type<unknown>,
  options?: SetupConfigOptions,
) : DynamicModule{
  // 获取所有存在的配置文件路径
  const existingFilePaths = getExistingFilePaths(
    baseDir,
    options?.folderName,
    options?.baseFileName,
    options?.profiles,
  );

  // 创建基础动态模块
  const dynamicModule = TypedConfigModule.forRoot({
    schema: rootSchemaClass,
    isGlobal: true,
    load: existingFilePaths.map((filePath) => {
      return fileLoader({
        absolutePath: filePath,
        ignoreEnvironmentVariableSubstitution: false,
        ignoreEmptySearchPlaces: false,
      });
    }),
  });

  // 扩展动态模块配置
  return {
    ...dynamicModule,
    providers: [
      ...(dynamicModule.providers ?? []),
      {
        provide: ROOT_CONFIG_ALIAS_TOKEN,
        useExisting: rootSchemaClass,
      },
    ],
    exports: [...(dynamicModule.exports ?? []), ROOT_CONFIG_ALIAS_TOKEN],
  };
}
