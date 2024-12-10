import * as process from 'node:process';

/**
 * 获取配置文件的配置信息
 *
 * 该函数从环境变量 NESTJS_PROFILES 中获取配置文件信息
 *
 * @returns {string[]} 返回配置文件名称数组
 *
 * 实现逻辑:
 * 1. 从环境变量中获取 NESTJS_PROFILES 的值
 * 2. 如果环境变量为空(null/undefined/''),则返回空数组
 * 3. 将环境变量值按逗号分隔,并对每个值进行 trim 和转小写处理
 */
export function getProfiles(): string[] {
  const profilesEnv = process.env['NESTJS_PROFILES'];

  if (profilesEnv === null || profilesEnv === undefined || profilesEnv === '') {
    return [];
  }

  return profilesEnv.split(',').map((p) => p.trim().toLowerCase());
}
