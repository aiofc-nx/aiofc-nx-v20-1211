import { existsSync } from 'node:fs';
import path from 'node:path';
import { getProfiles } from './get-profiles';
import {
  DEFAULT_CONFIGURATIONS_FOLDER_NAME,
  DEFAULT_CONFIGURATION_FILE_NAME,
} from '../constants';

/**
 * 获取存在的配置文件路径
 *
 * @description
 * 该函数用于查找和验证配置文件的存在性:
 * - 支持基础配置文件和特定环境的配置文件
 * - 自动处理文件扩展名
 * - 提供缺失文件的警告信息
 * - 验证至少存在一个配置文件
 *
 * @param baseDir - 基础目录路径
 * @param folderName - 配置文件夹名称,默认为 'config'
 * @param baseFileName - 基础配置文件名,默认为 'app.config'
 * @param profiles - 环境配置文件列表,默认从环境变量获取
 * @returns 存在的配置文件路径数组
 * @throws 当未找到任何配置文件时抛出错误
 */
export function getExistingFilePaths(
  baseDir: string,
  folderName = DEFAULT_CONFIGURATIONS_FOLDER_NAME,
  baseFileName = DEFAULT_CONFIGURATION_FILE_NAME,
  profiles = getProfiles(),
) {
  // 分割文件名获取扩展名和基础名
  const fileNameSplit = baseFileName.split('.');
  const extension = fileNameSplit.at(-1);
  const justName = fileNameSplit.slice(0, -1).join('.');

  // 生成所有可能的配置文件路径
  const profilePaths = profiles.map((p) => `${justName}-${p}.${extension}`);
  const files = [baseFileName, ...profilePaths];

  // 用于存储存在的文件路径和缺失的配置文件信息
  const existingFilePaths = [];
  const missingDetails = [];

  // 检查每个配置文件是否存在
  for (const name of files) {
    const filePath = path.join(baseDir, folderName, name);
    if (existsSync(filePath)) {
      existingFilePaths.push(filePath);
    } else {
      // 从文件名提取配置文件环境名称
      const profile = name.includes('env-')
        ? name.split('env-')[1].split('.')[0]
        : 'default';

      missingDetails.push(`'${profile}'`);
    }
  }

  // 如果有缺失的配置文件,输出警告信息
  if (missingDetails.length > 0 && existingFilePaths.length > 0) {
    const missingFilesList = missingDetails.join(', ');
    console.warn(
      `The following configuration files were not found in "${path.join(
        baseDir,
        folderName,
      )}" and will be skipped ${missingFilesList} profile`,
    );
  }

  // 如果没有找到任何配置文件,抛出错误
  if (existingFilePaths.length === 0) {
    throw new Error(
      `No configuration files found in "${path.join(
        baseDir,
        folderName,
      )}". Please check your configuration.`,
    );
  }

  return existingFilePaths;
}
