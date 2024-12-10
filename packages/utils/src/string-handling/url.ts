/**
 * URL Base64编解码工具模块
 *
 * @description
 * 该模块提供了以下功能:
 * 1. 将URL中的Base64字符串解码为对象
 * 2. 将对象编码为URL安全的Base64字符串
 */

/**
 * 从URL中解码Base64字符串为对象
 *
 * @description
 * 该函数将URL中的Base64编码字符串解码为JavaScript对象:
 * 1. 如果输入为undefined,返回空对象
 * 2. URL解码字符串
 * 3. Base64解码为UTF-8字符串
 * 4. 解析JSON字符串为对象
 * 5. 如果解析失败则返回空对象
 *
 * @param str - Base64编码的URL字符串,可选参数
 * @returns 解码后的JavaScript对象
 */
export const decodeBase64StringObjectFromUrl = (
  str?: string,
): Record<string, unknown> => {
  if (str === undefined) {
    return {};
  }

  try {
    return JSON.parse(
      Buffer.from(decodeURIComponent(str), 'base64').toString('utf8'),
    );
  } catch {
    return {};
  }
};

/**
 * 将对象编码为URL安全的Base64字符串
 *
 * @description
 * 该函数将JavaScript对象编码为URL安全的Base64字符串:
 * 1. 将对象转换为JSON字符串
 * 2. 使用UTF-8编码转换为Buffer
 * 3. 转换为Base64字符串
 * 4. URL编码确保安全传输
 *
 * @param obj - 要编码的JavaScript对象
 * @returns URL安全的Base64编码字符串
 */
export const encodeObjectToBase64ForUrl = (
  obj: Record<string, unknown>,
): string => {
  return encodeURIComponent(
    Buffer.from(JSON.stringify(obj), 'utf8').toString('base64'),
  );
};
