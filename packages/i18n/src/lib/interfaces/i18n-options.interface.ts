import { Type } from '@nestjs/common';
import {
  ClassProvider,
  ExistingProvider,
  FactoryProvider,
  ModuleMetadata,
  ValueProvider,
} from '@nestjs/common/interfaces';
import { I18nResolver } from './i18n-language-resolver.interface';
import { I18nLoader } from '../loaders';
import { ValidatorOptions } from 'class-validator';

export interface OptionsProvider {
  options: any;
}

export type OptionProvider<T = any> =
  | Omit<ClassProvider<T>, 'provide'>
  | Omit<ValueProvider<T>, 'provide'>
  | Omit<FactoryProvider<T>, 'provide'>
  | Omit<ExistingProvider<T>, 'provide'>
  | OptionsProvider;

export type ResolverWithOptions = {
  use: Type<I18nResolver>;
} & OptionProvider;

export type I18nOptionsWithoutResolvers = Omit<
  I18nOptions,
  'resolvers' | 'loader'
>;

export type I18nOptionResolver =
  | ResolverWithOptions
  | Type<I18nResolver>
  | I18nResolver;

export type Formatter = (
  template: string,
  ...args: (string | Record<string, string>)[]
) => string;

export interface I18nOptions {
  // 如果没有所需语言的翻译，则用作后备的默认语言。
  fallbackLanguage: string;
  // 特定键或短语的备用语言的可选字典。
  fallbacks?: { [key: string]: string };
  // 用于解析请求的翻译的解析器数组。
  resolvers?: I18nOptionResolver[];
  // 用于加载翻译数据的加载器类型。
  loaders: I18nLoader<unknown>[];
  // 用于格式化翻译的格式化程序（例如，用于日期或数字格式化）。
  formatter?: Formatter;
  // 是否为 i18n 操作启用日志记录。
  logging?: boolean;
  // 用于渲染模板的视图引擎（如果适用）。
  viewEngine?: 'hbs' | 'pug' | 'ejs';
  // 是否禁用任何与 i18n 相关的中间件。
  disableMiddleware?: boolean;
  // 是否跳过与 i18n 相关的异步钩子。
  skipAsyncHook?: boolean;
  // i18n 验证器的配置选项。
  validatorOptions?: I18nValidatorOptions;
  // 当翻译键丢失时是否抛出错误。
  throwOnMissingKey?: boolean;
  // 生成类型的输出路径（如果有）。
  typesOutputPath?: string;
}

export interface I18nOptionsFactory {
  createI18nOptions():
    | Promise<I18nOptionsWithoutResolvers>
    | I18nOptionsWithoutResolvers;
}

export interface I18nAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  name?: string;
  useExisting?: Type<I18nOptionsFactory>;
  useClass?: Type<I18nOptionsFactory>;
  useFactory?: (
    ...args: any[]
  ) => Promise<I18nOptionsWithoutResolvers> | I18nOptionsWithoutResolvers;
  resolvers?: I18nOptionResolver[];
  loaders?: I18nLoader<unknown>[];
  inject?: any[];
  logging?: boolean;
}

export type I18nValidatorOptions = ValidatorOptions;
