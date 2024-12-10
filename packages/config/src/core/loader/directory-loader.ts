import type { OptionsSync } from 'cosmiconfig';
import { readdirSync } from 'fs';
import { fileLoader } from './file-loader';
import fromPairs from 'lodash.frompairs';

export interface DirectoryLoaderOptions extends OptionsSync {
  /**
   * 包含所有配置文件的目录.
   */
  directory: string;
  /**
   * 要包含的文件正则表达式.
   */
  include?: RegExp;
  /**
   * 如果为“true”，则忽略环境变量替换。
   *默认值：true
   */
  ignoreEnvironmentVariableSubstitution?: boolean;
}

/**
 * 目录加载器加载特定文件夹中的配置。
 * 文件的基本名称将用作配置键，对于以下目录：
 *
 * ```
 * .
 * └─config
 *    ├── app.toml
 *    └── db.toml
 * ```
 *
 * 解析后的配置将是 `{ app: "config in app.toml", db: "config in db.toml" }`
 * @param选项目录加载器选项.
 */
export const directoryLoader = ({
  directory,
  ...options
}: DirectoryLoaderOptions) => {
  return (): Record<string, any> => {
    const files = readdirSync(directory).filter(fileName =>
      options.include ? options.include.test(fileName) : true,
    );
    const fileNames = [
      ...new Set(files.map(file => file.replace(/\.\w+$/, ''))),
    ];
    const configs = fromPairs(
      fileNames.map(name => [
        name,
        fileLoader({
          basename: name,
          searchFrom: directory,
          ...options,
        })(),
      ]),
    );

    return configs;
  };
};
