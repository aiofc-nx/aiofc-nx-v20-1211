/*
使用类型安全的 ClsService
指南：https://papooch.github.io/nestjs-cls/features-and-use-cases/type-safety-and-type-inference
*/
import type { ClsStore } from '@aiofc/nestjs-cls';

/**
 * 租户上下文存储接口
 * 继承自ClsStore,添加了租户ID字段
 */
export interface TenantClsStore extends ClsStore {
  tenantId?: string;
}
/*
  可以继续扩展其他的租户相关的字段，支持嵌套，示例：
  tenantId: string;
    user: {
        id: number;
        authorized: boolean;
    }
  */