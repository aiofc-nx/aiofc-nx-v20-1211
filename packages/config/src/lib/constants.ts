/**
 * 配置相关常量
 *
 * @description
 * 定义了配置模块使用的关键常量:
 * - ROOT_CONFIG_ALIAS_TOKEN: 根配置别名令牌,用于依赖注入
 * - DEFAULT_CONFIGURATIONS_FOLDER_NAME: 默认配置文件夹名称,默认为 'assets'
 * - DEFAULT_CONFIGURATION_FILE_NAME: 默认配置文件名,默认为 '.env.yaml'
 */

/**
 * 根配置别名令牌
 */
export const ROOT_CONFIG_ALIAS_TOKEN = 'ROOT_CONFIG_ALIAS_TOKEN';
/**
 * 默认配置文件夹名称
 *
 * @description
 * - 定义了存放配置文件的默认文件夹名称为 'assets'
 * - 该常量被用于 getExistingFilePaths 等函数中作为默认值
 * - 用户可以通过 SetupConfigOptions 接口的 folderName 选项覆盖此默认值
 */
export const DEFAULT_CONFIGURATIONS_FOLDER_NAME = 'assets';
/**
 * 默认配置文件名称
 *
 * @description
 * - 定义了默认的配置文件名为 '.env.yaml'
 * - 该常量被用于 getExistingFilePaths 等函数中作为默认值
 * - 支持 YAML 格式的配置文件
 * - 用户可以通过 SetupConfigOptions 接口的 baseFileName 选项覆盖此默认值
 */
export const DEFAULT_CONFIGURATION_FILE_NAME = '.env.yaml';
