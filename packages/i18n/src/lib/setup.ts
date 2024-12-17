import { I18Config } from './config/i18';
import * as path from 'node:path';
import { I18nModule } from './i18n.module';
import { I18nJsonLoader } from './loaders';
import { HeaderResolver } from './resolvers';

/**
 * @link https://github.com/Nikaple/nest-typed-config
 * */
export function i18nModuleForRootAsync(
  baseDir: string,
  {
    fallbacks = {
      'en-*': 'en',
    },
    fallbackLanguage = 'zh', // 如果没有所需语言的翻译，则用作后备的默认语言
  }: {
    fallbacks?: Record<string, string>;
    fallbackLanguage?: string;
  } = {}
) {
  return I18nModule.forRootAsync({
    imports: undefined,
    useFactory: (config: I18Config) => {
      return {
        // 如果没有所需语言的翻译，则用作后备的默认语言。
        fallbackLanguage,
        fallbacks,
        // 用于加载翻译数据的加载器类型。
        loaders: config.paths.map((p) => {
          return new I18nJsonLoader({
            path: path.join(baseDir, p),
          });
        }),
      };
    },
    // 用于解析请求的翻译的解析器数组。解析器用于获取我们请求的当前语言。
    // 在基本的 Web 应用程序中，这是通过 Accept-Language 标头完成的
    // nestjs-i18n 附带一组内置解析器:https://nestjs-i18n.com/quick-start
    resolvers: [HeaderResolver],
    // resolvers: [
    //     new QueryResolver(["lang", "l"]),
    //     new HeaderResolver(["x-custom-lang"]),
    //     new CookieResolver(),
    //     AcceptLanguageResolver,
    //   ],

    inject: [I18Config],
  });
}
