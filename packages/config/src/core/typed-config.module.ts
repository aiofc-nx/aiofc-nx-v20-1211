import { Module, DynamicModule, Provider } from '@nestjs/common';
import { red, yellow, cyan, blue } from 'chalk';
import type { ClassConstructor } from 'class-transformer';
import type { ValidatorOptions, ValidationError } from 'class-validator';
import merge from 'lodash.merge';
import {
  TypedConfigModuleAsyncOptions,
  TypedConfigModuleOptions,
} from './interfaces/typed-config-module-options.interface';
import { forEachDeep } from './utils/for-each-deep.util';
import { identity } from './utils/identity.util';
import { debug } from './utils/debug.util';
import { validateSync, plainToClass } from './utils/imports.util';
/**
 * @description 配置模块类
 * 提供了配置的加载、验证和注入功能:
 * - 支持同步和异步加载配置
 * - 使用class-validator进行配置验证
 * - 支持配置的规范化和自定义验证
 * - 可以全局注入配置对象
 */
@Module({})
export class TypedConfigModule {
  /**
   * 同步加载配置
   * @param options 配置选项,包含加载器函数等
   * @returns 动态模块定义
   */
  public static forRoot(options: TypedConfigModuleOptions): DynamicModule {
    const rawConfig = this.getRawConfig(options.load);
    return this.getDynamicModule(options, rawConfig);
  }

  /**
   * 异步加载配置
   * @param options 异步配置选项
   * @returns Promise<DynamicModule> 动态模块定义
   */
  public static async forRootAsync(
    options: TypedConfigModuleAsyncOptions,
  ): Promise<DynamicModule> {
    const rawConfig = await this.getRawConfigAsync(options.load);
    return this.getDynamicModule(options, rawConfig);
  }

  /**
   * 获取动态模块定义
   * @param options 配置选项
   * @param rawConfig 原始配置数据
   * @returns 动态模块定义
   */
  private static getDynamicModule(
    options: TypedConfigModuleOptions | TypedConfigModuleAsyncOptions,
    rawConfig: Record<string, any>,
  ) {
    const {
      schema: Config,
      normalize = identity,
      validationOptions,
      isGlobal = true,
      validate = this.validateWithClassValidator.bind(this),
    } = options;

    if (typeof rawConfig !== 'object') {
      console.log('配置应该是一个对象，接收到：${rawConfig}。请检查"load()"的返回值')
      throw new Error(
        `Configuration should be an object, received: ${rawConfig}. Please check the return value of \`load()\``,
      );
    }
    const normalized = normalize(rawConfig);
    const config = validate(normalized, Config, validationOptions);
    const providers = this.getProviders(config, Config);

    return {
      global: isGlobal,
      module: TypedConfigModule,
      providers,
      exports: providers,
    };
  }

  /**
   * 获取原始配置数据
   * @param load 配置加载器函数或函数数组
   * @returns 合并后的配置对象
   */
  private static getRawConfig(load: TypedConfigModuleOptions['load']) {
    if (Array.isArray(load)) {
      const config = {};
      for (const fn of load) {
        try {
          const conf = fn(config);
          merge(config, conf);
        } catch (e: any) {
          debug(
            `Config load failed: ${e}. Details: ${JSON.stringify(e.details)}`,
          );
          throw e;
        }
      }
      return config;
    }
    return load();
  }

  /**
   * 异步获取原始配置数据
   * @param load 异步配置加载器函数或函数数组
   * @returns Promise<配置对象>
   */
  private static async getRawConfigAsync(
    load: TypedConfigModuleAsyncOptions['load'],
  ) {
    if (Array.isArray(load)) {
      const config = {};
      for (const fn of load) {
        try {
          const conf = await fn(config);
          merge(config, conf);
        } catch (e: any) {
          debug(
            `Config load failed: ${e}. Details: ${JSON.stringify(e.details)}`,
          );
          throw e;
        }
      }
      return config;
    }
    return load();
  }

  /**
   * 获取配置提供者数组
   * @param config 配置对象
   * @param Config 配置类
   * @returns Provider[] 提供者数组
   */
  private static getProviders(
    config: any,
    Config: ClassConstructor<any>,
  ): Provider[] {
    const providers: Provider[] = [
      {
        provide: Config,
        useValue: config,
      },
    ];
    forEachDeep(config, value => {
      if (
        value &&
        typeof value === 'object' &&
        !Array.isArray(value) &&
        value.constructor !== Object
      ) {
        providers.push({ provide: value.constructor, useValue: value });
      }
    });

    return providers;
  }

  /**
   * 使用class-validator验证配置
   * @param rawConfig 原始配置数据
   * @param Config 配置类
   * @param options 验证选项
   * @returns 验证后的配置对象
   */
  private static validateWithClassValidator(
    rawConfig: any,
    Config: ClassConstructor<any>,
    options?: Partial<ValidatorOptions>,
  ) {
    const config = plainToClass(Config, rawConfig, {
      exposeDefaultValues: true,
    });
    const schemaErrors = validateSync(config, {
      forbidUnknownValues: true,
      whitelist: true,
      ...options,
    });
    if (schemaErrors.length > 0) {
      const configErrorMessage = this.getConfigErrorMessage(schemaErrors);
      console.log('配置参数验证未能通过！');
      console.log(config)
      throw new Error(configErrorMessage);
    }
    console.log(`\n解析配置文件的信息，生产环境应当删除这段代码:\n`);
    console.log(config);
    console.log(`\n`);
    return config;
  }

  /**
   * 获取配置错误信息
   * @param errors 验证错误数组
   * @returns 格式化后的错误信息
   */
  static getConfigErrorMessage(errors: ValidationError[]): string {
    const messages = this.formatValidationError(errors)
      .map(({ property, value, constraints }) => {
        const constraintMessage = Object.entries(
          constraints || /* istanbul ignore next */ {},
        )
          .map(
            ([key, val]) =>
              `    - ${key}: ${yellow(val)}, current config is \`${blue(
                JSON.stringify(value),
              )}\``,
          )
          .join(`\n`);
        const msg = [
          `  - config ${cyan(property)} does not match the following rules:`,
          `${constraintMessage}`,
        ].join(`\n`);
        return msg;
      })
      .filter(Boolean)
      .join(`\n`);
    const configErrorMessage = red(
      `Configuration is not valid:\n${messages}\n`,
    );
    return configErrorMessage;
  }

  /**
   * 格式化验证错误
   * @param errors 验证错误数组
   * @returns 格式化后的错误对象数组
   */
  private static formatValidationError(errors: ValidationError[]) {
    const result: {
      property: string;
      constraints: ValidationError['constraints'];
      value: ValidationError['value'];
    }[] = [];
    const helper = (
      { property, constraints, children, value }: ValidationError,
      prefix: string,
    ) => {
      const keyPath = prefix ? `${prefix}.${property}` : property;
      if (constraints) {
        result.push({
          property: keyPath,
          constraints,
          value,
        });
      }
      if (children && children.length) {
        children.forEach(child => helper(child, keyPath));
      }
    };
    errors.forEach(error => helper(error, ``));
    return result;
  }
}
