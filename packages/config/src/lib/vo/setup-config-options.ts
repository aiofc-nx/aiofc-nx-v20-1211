/**
 * 配置设置选项接口
 *
 * @description
 * 该接口定义了配置模块的设置选项:
 * - folderName: 配置文件所在的文件夹名称,可选
 * - baseFileName: 基础配置文件名,可选
 * - profiles: 环境配置文件列表,可选
 *
 * 使用场景:
 * - 用于自定义配置文件的加载路径和名称
 * - 支持多环境配置文件的加载
 * - 提供灵活的配置文件组织方式
 */
export interface SetupConfigOptions {
  folderName?: string;
  baseFileName?: string;
  profiles?: string[];
}
