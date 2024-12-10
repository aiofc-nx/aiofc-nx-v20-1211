import { ArrayNotEmpty, IsString } from 'class-validator';

/**
 * I18n 配置类
 *
 * @description
 * 定义了 I18n 模块的配置选项:
 * - paths: 翻译文件的路径列表
 *
 * 使用装饰器进行验证:
 * - @IsString({each: true}): 验证 paths 数组中的每个元素都是字符串
 * - @ArrayNotEmpty(): 验证 paths 数组不能为空
 *
 * paths 属性使用 ! 断言操作符表示该属性一定会被赋值,
 * 避免 TypeScript 的严格初始化检查报错
 */
export class I18Config {
  @IsString({
    each: true,
  })
  @ArrayNotEmpty()
  paths!: string[];
}
