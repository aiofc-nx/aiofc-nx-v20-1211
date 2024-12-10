import { EntitySchema } from 'typeorm';

/**
 * 实体类或Schema类型
 *
 * @description
 * 定义了TypeORM中实体的两种可能类型:
 * 1. Function - 实体类,使用装饰器定义的普通类
 * 2. EntitySchema - 使用Schema方式定义的实体结构
 *
 * 这个类型用于在模块注册实体时,同时支持这两种定义方式。
 * 主要在:
 * - TypeOrmModule.forFeature()方法中使用
 * - Repository注入时使用
 */
export type EntityClassOrSchema = Function | EntitySchema;
