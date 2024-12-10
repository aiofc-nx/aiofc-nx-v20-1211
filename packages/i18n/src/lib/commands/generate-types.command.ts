import yargs from 'yargs';
import { I18nJsonLoader, I18nYamlLoader, I18nLoader } from '../loaders';
import chalk from 'chalk';
import { I18nTranslation } from '../interfaces';
import { mergeDeep, mergeTranslations } from '../utils';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import chokidar, { FSWatcher } from 'chokidar';
import { pathExists, realpath } from 'fs-extra';
import { importOrRequireFile } from '../utils/import';
import { annotateSourceCode, createTypesFile } from '../utils/typescript';
/**
 * 生成类型的命令行参数接口
 *
 * @description
 * 定义了生成类型命令所需的参数:
 * - typesOutputPath: 生成的类型文件输出路径
 * - watch: 是否监听文件变化
 * - debounce: 防抖延迟时间
 * - loaderType: 加载器类型数组
 * - optionsFile: 可选的配置文件路径
 * - translationsPath: 翻译文件路径数组
 */
export interface GenerateTypesArguments {
  typesOutputPath: string;
  watch: boolean;
  debounce: number;
  loaderType: string[];
  optionsFile?: string;
  translationsPath: string[];
}

/**
 * 翻译数据类型
 *
 * @description
 * 定义了翻译数据的结构:
 * - translations: 翻译内容
 * - error: 加载过程中的错误信息
 * - path: 翻译文件路径
 */
type TranslationsType = {
  translations: I18nTranslation;
  error: (I18nTranslation & Error) | null;
  path: string;
};

/**
 * 生成类型的命令行工具类
 *
 * @description
 * 实现了 yargs.CommandModule 接口,提供以下功能:
 * 1. 定义命令行参数和选项
 * 2. 处理命令执行逻辑
 * 3. 支持文件监听和类型自动生成
 * 4. 错误处理和日志输出
 */
export class GenerateTypesCommand
  implements yargs.CommandModule<object, GenerateTypesArguments>
{
  /** 文件系统监听器实例 */
  fsWatcher: chokidar.FSWatcher | undefined;
  /** 命令名称 */
  command = 'generate-types';
  /** 命令描述 */
  describe = 'Generate types for translations. Supports json and yaml files.';

  /**
   * 构建命令行参数
   *
   * @description
   * 配置命令支持的选项:
   * - debounce: 防抖时间
   * - optionsFile: 配置文件路径
   * - watch: 是否监听文件变化
   * - typesOutputPath: 类型文件输出路径
   * - loaderType: 加载器类型
   * - translationsPath: 翻译文件路径
   */
  builder(args: yargs.Argv<object>) {
    return args
      .option('debounce', {
        alias: 'd',
        type: 'number',
        describe: 'Debounce time in ms',
        default: 200,
        demandOption: false,
      })
      .option('optionsFile', {
        alias: 'opt',
        type: 'string',
        describe: 'Options file path',
        demandOption: false,
      })
      .option('watch', {
        alias: 'w',
        type: 'boolean',
        describe: 'Watch for changes and generate types',
        default: false,
        demandOption: false,
      })
      .option('typesOutputPath', {
        alias: 'o',
        type: 'string',
        describe: 'Path to output types file',
        default: 'src/generated/i18n.generated.ts',
        demandOption: false,
      })
      .option('loaderType', {
        alias: 't',
        type: 'string',
        array: true,
        options: ['json', 'yaml'],
        describe: 'Loader type',
        demandOption: false,
        default: [],
      })
      .option('translationsPath', {
        alias: 'p',
        type: 'string',
        describe: 'Path to translations',
        array: true,
        default: [],
        demandOption: false,
      });
  }

  /**
   * 命令处理函数
   *
   * @description
   * 执行类型生成的主要逻辑:
   * 1. 加载和验证配置
   * 2. 初始化加载器
   * 3. 加载翻译文件
   * 4. 生成类型定义
   * 5. 处理文件监听(如果启用)
   */
  async handler(args: yargs.Arguments<GenerateTypesArguments>): Promise<void> {
    const { packageConfig = {}, packageJsonFilePath } =
      (await getPackageConfig()) || {};

    packageConfig['i18n'] = packageConfig['i18n'] ?? {};

    if (!args.typesOutputPath && packageConfig['i18n'].typesOutputPath) {
      args.typesOutputPath = packageConfig['i18n'].typesOutputPath;
    }

    if (args.optionsFile) {
      args.optionsFile = path.resolve(process.cwd(), args.optionsFile);
    }

    if (!args.optionsFile && packageConfig['i18n'].optionsFile) {
      const packageJsonFolder = path.dirname(packageJsonFilePath);
      args.optionsFile = path.join(
        packageJsonFolder,
        packageConfig['i18n'].optionsFile,
      );
    }

    if (!args.typesOutputPath) {
      console.log(
        chalk.red(
          `Error: typesOutputPath is not defined. Please provide a path to output types file, in params or in package.json`,
        ),
      );
      process.exit(1);
    }

    args.translationsPath = sanitizePaths(args.translationsPath);

    validateInputParams(args);
    validatePathsNotEmbeddedInEachOther(args.translationsPath);

    const optionsFromFile = await validateAndGetOptionsFile(args.optionsFile);

    const loaders = args.loaderType.map((loaderType, index) => {
      const path = args.translationsPath[index];
      validatePath(path, loaderType, index);
      return {
        path,
        loader: getLoaderByType(loaderType, path),
      };
    });

    for (const loader of optionsFromFile?.loaders || []) {
      const p = loader?.options?.path;

      loaders.push({
        path: p ?? sanitizePath(p),
        loader: loader,
      });
    }

    const translationsWithPaths = await loadTranslations(loaders);
    const validTranslationsWithPaths = translationsWithPaths.filter(
      (item): item is TranslationsType => Boolean(item.path),
    );

    let hasError = false;

    const translationsMapped = translationsWithPaths.map(
      ({ translations, error, path }) => {
        if (error) {
          console.log(
            chalk.red(
              `Error while loading translations from ${path}: ${error.message}`,
            ),
          );
          hasError = true;
        }
        return translations;
      },
    );

    const validTranslations = translationsMapped.filter(
      (translation): translation is I18nTranslation =>
        translation !== null && translation !== undefined,
    );

    if (!hasError && validTranslations.length > 0) {
      const mergedTranslations = reduceTranslations(validTranslations);
      await generateAndSaveTypes(mergedTranslations, args);
    } else if (!args.watch) {
      process.exit(1);
    }

    if (args.watch) {
      console.log(
        chalk.green(
          `Listening for changes in ${args.translationsPath.join(', ')}...`,
        ),
      );
      if (this.fsWatcher === undefined) {
        this.fsWatcher = await listenForChanges(
          loaders,
          validTranslationsWithPaths,
          args,
        );
      }
    } else {
      process.exit(0);
    }
  }

  /**
   * 停止文件监听
   *
   * @description
   * 关闭文件系统监听器
   */
  async stopWatcher() {
    if (this.fsWatcher) {
      await this.fsWatcher.close();
    }
  }
}

/**
 * 验证路径嵌套
 *
 * @description
 * 检查翻译文件路径是否存在嵌套关系:
 * - 不支持嵌套路径,因为会触发多次监听
 * - 同一个文件夹不应该被监听多次
 *
 * @param paths 需要验证的路径数组
 */
function validatePathsNotEmbeddedInEachOther(paths: string[]) {
  for (let i = 0; i < paths.length; i++) {
    const pathToCheck = paths[i];
    for (const [j, pathToCompare] of paths.entries()) {
      if (j !== i && pathToCheck.startsWith(pathToCompare)) {
        console.log(
          chalk.red(
            `Path ${pathToCheck} is embedded in ${pathToCompare}. This is not supported.`,
          ),
        );
        process.exit(1);
      }
    }
  }
}

/**
 * 监听文件变化
 *
 * @description
 * 使用 chokidar 监听翻译文件的变化:
 * 1. 初始化文件监听器
 * 2. 处理文件变化事件
 * 3. 支持错误处理和防抖
 *
 * @param loadersWithPaths 加载器和路径的映射
 * @param translationsWithPaths 翻译内容和路径的映射
 * @param args 命令行参数
 * @returns Promise<FSWatcher> 文件监听器实例
 */
function listenForChanges(
  loadersWithPaths: {
    path: string;
    loader: I18nLoader<unknown>;
  }[],
  translationsWithPaths: { path: string; translations: I18nTranslation }[],
  args: GenerateTypesArguments,
): Promise<FSWatcher> {
  const allPaths = loadersWithPaths.map(({ path }) => path);

  const loadersByPath = loadersWithPaths.reduce(
    (acc, { path, loader }) => {
      acc[path] = loader;
      return acc;
    },
    {} as { [key: string]: I18nLoader<unknown> },
  );

  return new Promise((resolve, reject) => {
    const fsWatcher = chokidar
      .watch(allPaths, {
        ignoreInitial: true,
      })
      .on('ready', () => {
        resolve(fsWatcher);
      })
      .on('error', (error) => {
        console.log(chalk.red(`Error while watching files: ${error.message}`));
        reject(error);
      })
      .on(
        'all',
        customDebounce(
          handleFileChangeEvents(
            allPaths,
            loadersByPath,
            translationsWithPaths,
            args,
          ),
          args.debounce,
        ),
      );
  });
}

/**
 * 路径处理工具函数
 * 处理路径末尾的斜杠,确保路径格式统一
 */
function sanitizePath(path: string) {
  // adding trailing slash
  const newPath = path.endsWith('/') ? path : `${path}/`;
  // removing starting slash
  return newPath.startsWith('./') ? newPath.slice(2) : newPath;
}

/**
 * 批量处理多个路径
 */
function sanitizePaths(paths: string[]) {
  return paths.map((path) => {
    return sanitizePath(path);
  });
}

/**
 * 处理文件变更事件的主要函数
 * 当监听的文件发生变化时,重新生成类型定义
 */
function handleFileChangeEvents(
  listenToPaths: string[],
  loadersByPath: {
    [key: string]: I18nLoader<unknown>;
  },
  translationsWithPaths: { path: string; translations: I18nTranslation }[],
  args: GenerateTypesArguments,
) {
  return async (events: string[], paths: string[]) => {
    console.log(chalk.blue(`Change detected`));
    console.log(
      chalk.green(
        `${events.map((e, idx) => `\t${e} - ${paths[idx]}`).join('\n')}`,
      ),
    );
    console.log(chalk.blue(`Re-generating types...`));

    // 收集所有变更的唯一路径
    const uniquePaths = new Set<string>();

    for (const changePath of paths) {
      const foundPath = listenToPaths.find((path) =>
        changePath.startsWith(path),
      );
      if (foundPath) {
        uniquePaths.add(foundPath);
      }
      if (uniquePaths.size === paths.length) {
        break;
      }
    }
    let hasError = false;

    // 重新加载每个变更路径的翻译
    for (const path of uniquePaths) {
      const loader = loadersByPath[path];
      try {
        const translation = (await loader.load()) as I18nTranslation;

        for (const translationWithPath of translationsWithPaths) {
          if (translationWithPath.path === path) {
            translationWithPath.translations = translation;
          }
        }
      } catch (error) {
        hasError = true;
        if (error instanceof Error) {
          console.log(
            chalk.red(
              `Error while loading translations from ${path}. Error: ${error.message}`,
            ),
          );
        } else {
          console.log(
            chalk.red(
              `Error while loading translations from ${path}. Error: ${JSON.stringify(
                error,
              )}`,
            ),
          );
        }
      }
    }

    if (hasError) {
      console.log(chalk.red(`Waiting for changes to generate proper types`));
      return;
    }

    // 合并所有翻译并生成类型
    const mergedTranslations = reduceTranslations(
      translationsWithPaths.map(({ translations }) => translations),
    );
    await generateAndSaveTypes(mergedTranslations, args);
  };
}

/**
 * 生成并保存类型定义文件
 * 将翻译对象转换为TypeScript类型定义
 */
async function generateAndSaveTypes(
  translations: I18nTranslation,
  args: GenerateTypesArguments,
) {
  const object = Object.keys(translations).reduce(
    (result, key) => mergeDeep(result, translations[key]),
    {},
  );

  const rawContent = await createTypesFile(object);

  const outputFile = annotateSourceCode(rawContent);

  fs.mkdirSync(path.dirname(args.typesOutputPath), {
    recursive: true,
  });

  let currentFileContent = null;
  try {
    currentFileContent = fs.readFileSync(args.typesOutputPath, 'utf8');
  } catch {
    //   expected empty line
  }

  // biome-ignore lint/suspicious/noDoubleEquals: <explanation>
  if (currentFileContent == outputFile) {
    console.log(`
        ${chalk.yellow('No changes generated in a result output type file.')}
      `);
  } else {
    fs.writeFileSync(args.typesOutputPath, outputFile);
    console.log(`
        ${chalk.green(`Types generated and saved to: ${args.typesOutputPath}`)}
      `);
  }
}

/**
 * 自定义防抖函数
 * 用于限制文件变更事件的触发频率
 */
function customDebounce(func: (...args: any[]) => void, wait: number) {
  let args: any[] = [];
  let timeoutId: NodeJS.Timeout;

  return function (...rest: any[]) {
    // User formal parameters to make sure we add a slot even if a param
    // is not passed in
    if (func.length > 0) {
      for (let i = 0; i < func.length; i++) {
        if (!args[i]) {
          args[i] = [];
        }
        args[i].push(rest[i]);
      }
    }
    // No formal parameters, just track the whole argument list
    else {
      args.push(...rest);
    }
    clearTimeout(timeoutId);

    timeoutId = setTimeout(function () {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      func.apply(this, args);
      args = [];
    }, wait);
  };
}

/**
 * 加载所有翻译文件
 * 使用提供的加载器加载翻译内容
 */
async function loadTranslations(
  loaders: {
    loader: I18nLoader<unknown>;
    path?: string;
  }[],
) {
  const loadedTranslations: I18nTranslation[] = await Promise.all(
    loaders.map(({ loader }) => loader.load().catch((error) => error)),
  );

  return loadedTranslations.map((result, index) => {
    const isError = result instanceof Error;
    return {
      translations: isError ? null : result,
      error: isError ? result : null,
      path: loaders[index].path,
    };
  });
}

/**
 * 验证并获取选项文件内容
 * 检查选项文件是否符合要求
 */
async function validateAndGetOptionsFile(optionsFile?: string) {
  if (optionsFile) {
    let optionsFileExport;
    try {
      optionsFileExport = await importOrRequireFile(optionsFile);
    } catch (error) {
      throw error instanceof Error
        ? new Error(`Unable to open file: "${optionsFile}". ${error.message}`)
        : new Error(`Unable to open file: "${optionsFile}". `);
    }

    if (!optionsFileExport || typeof optionsFileExport !== 'object') {
      throw new Error(
        `Given options file must contain export of a I18nOptions instance`,
      );
    }

    const optionsExported = [];

    for (const key in optionsFileExport) {
      const options = optionsFileExport[key];

      if (options.loaders) {
        optionsExported.push(options);
      }
    }

    if (optionsExported.length === 0) {
      throw new Error(
        `Given options file must contain export of a I18nOptions`,
      );
    }
    if (optionsExported.length > 1) {
      throw new Error(
        `Given options file must contain only one export of I18nOptions`,
      );
    }
    return optionsExported[0];
  }
}

/**
 * 验证输入参数
 * 确保提供的参数有效且完整
 */
function validateInputParams(args: GenerateTypesArguments) {
  if (args.loaderType.length !== args.translationsPath.length) {
    console.log(
      chalk.red(
        `Error: translationsPath and loaderType must have the same number of elements.
           You provided ${args.loaderType.length} loader types and ${args.translationsPath.length} paths`,
      ),
    );
    process.exit(1);
  }

  if (
    (args.loaderType.length === 0 || args.loaderType.length === 0) &&
    !args.optionsFile
  ) {
    console.log(
      chalk.red(
        `Error: you must provide at least one loader type or options file`,
      ),
    );
    process.exit(1);
  }
}

/**
 * 验证路径
 * 确保每个加载器类型都有对应的翻译路径
 */
function validatePath(path: string, loaderType: string, index: number) {
  if (path === undefined) {
    console.log(
      chalk.red(
        `Error: translationsPath is not defined for loader type ${loaderType},
                 please provide a path to translations, index ${index}`,
      ),
    );
    process.exit(1);
  }
}

type Dictionary<T = any> = { [k: string]: T };

/**
 * 获取package.json配置
 * 递归向上查找package.json文件
 */
async function getPackageConfig(basePath = process.cwd()): Promise<{
  packageJsonFilePath: string;
  packageConfig: Dictionary;
}> {
  const packageJsonFilePath = `${basePath}/package.json`;
  if (await pathExists(packageJsonFilePath)) {
    /* istanbul ignore next */
    try {
      const packageConfig = await require(packageJsonFilePath);
      return {
        packageJsonFilePath,
        packageConfig,
      };
    } catch {
      throw new Error(`Failed to load package.json`);
    }
  }

  const parentFolder = await realpath(`${basePath}/..`);

  // we reached the root folder
  if (basePath === parentFolder) {
    throw new Error(
      `Reached the root folder without finding package.json in ${basePath}`,
    );
  }

  return getPackageConfig(parentFolder);
}

/**
 * 根据类型获取对应的加载器实例
 * 支持json和yaml格式的加载器
 */
function getLoaderByType(loaderType: string, path: string) {
  switch (loaderType) {
    case 'json': {
      return new I18nJsonLoader({
        path,
      });
    }
    case 'yaml': {
      return new I18nYamlLoader({
        path,
      });
    }
    default: {
      console.log(
        chalk.red(`Error: loader type ${loaderType} is not supported`),
      );
      process.exit(1);
    }
  }
}

/**
 * 合并多个翻译对象
 * 将所有翻译合并为一个对象
 */
function reduceTranslations(translations: I18nTranslation[]) {
  return translations.reduce((acc, t) => mergeTranslations(acc, t), {});
}
