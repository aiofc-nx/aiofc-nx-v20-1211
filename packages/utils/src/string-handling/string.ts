/**
 * 字符串处理工具模块
 *
 * @description
 * 该模块提供了以下字符串处理功能:
 * 1. 将字符串转换为大写单词形式
 * 2. 首字母大写处理
 */

/**
 * 将字符串转换为大写单词形式
 *
 * @description
 * 该函数将输入字符串转换为大写单词形式:
 * 1. 如果输入为undefined,返回空字符串
 * 2. 将字符串转为小写
 * 3. 使用正则表达式匹配单词
 * 4. 对每个单词进行首字母大写处理
 * 5. 用空格连接所有单词
 *
 * @param name - 输入字符串,可选参数
 * @returns 转换后的大写单词字符串
 */
export function toCapitalizedWords(name?: string): string {
  if (name === undefined) {
    return '';
  }

  const words = name.toLowerCase().match(/[A-Za-z][a-z]*/g) || [];
  return words.map(capitalize).join(' ');
}

/**
 * 字符串首字母大写处理
 *
 * @description
 * 将输入单词的首字母转为大写:
 * 1. 获取首字母并转为大写
 * 2. 拼接剩余字母
 *
 * @param word - 输入单词
 * @returns 首字母大写的单词
 */
export function capitalize(word: string) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}
