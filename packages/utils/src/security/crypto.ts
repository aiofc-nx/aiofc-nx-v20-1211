import * as argon2 from 'argon2';
import { customAlphabet, nanoid } from 'nanoid';
/**
 * 加密和随机数生成工具模块
 *
 * @description
 * 该模块提供了以下功能:
 * 1. 生成随机ID和数字
 * 2. 密码加密和验证
 */

/**
 * 生成不包含特殊字符的随机ID的函数
 * 仅包含数字和大写字母
 */
const nanoidNoSpecialCharacters = customAlphabet(
  '1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ',
);

/**
 * 生成纯数字随机ID的函数
 */
const nanoidOnlyNumbers = customAlphabet('1234567890');

/**
 * 异步生成随机ID
 * @returns 返回一个包含字母、数字和特殊字符的随机字符串
 */
export async function generateRandomIdAsync() {
  return nanoid();
}

/**
 * 同步生成随机ID
 * @returns 返回一个包含字母、数字和特殊字符的随机字符串
 */
export function generateRandomId() {
  return nanoid();
}

/**
 * 生成不包含特殊字符的随机ID
 * @param length - 生成的ID长度，默认为11位
 * @returns 返回一个仅包含数字和大写字母的随机字符串
 */
export function generateRandomIdWithoutSpecialCharacters(length = 11) {
  return nanoidNoSpecialCharacters(length);
}

/**
 * 生成指定长度的随机数字
 * @param length - 生成的数字长度，默认为6位
 * @returns 返回一个指定长度的随机数字
 */
export function generateRandomNumber(length = 6): number {
  return Number.parseInt(nanoidOnlyNumbers(length));
}

/**
 * 使用argon2算法对密码进行加密
 * @param password - 需要加密的原始密码
 * @returns 返回加密后的密码哈希值
 * @todo 添加盐值处理
 */
export function hashPassword(password: string) {
  return argon2.hash(password);
}

/**
 * 验证密码是否匹配
 * @param password - 待验证的原始密码
 * @param hashedPassword - 已加密的密码哈希值
 * @returns 返回密码是否匹配的布尔值
 */
export async function verifyPassword(password: string, hashedPassword: string) {
  return argon2.verify(hashedPassword, password);
}
