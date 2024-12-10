import { SetMetadata } from '@nestjs/common';
import { SKIP_AUTH } from '../vo/constants';

/**
 * SkipAuth 装饰器
 * 用于标记某个路由或控制器不需要进行身份验证
 *
 * 使用方法:
 * @SkipAuth()
 *
 * @returns 一个装饰器函数,设置 SKIP_AUTH 元数据为 true
 */
export const SkipAuth = () => SetMetadata(SKIP_AUTH, true);
