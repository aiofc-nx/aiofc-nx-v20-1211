
import { TrackedTypeormBaseEntity } from "../entity/tracked-typeorm-base-entity";
import { TypeormBaseEntity } from "../entity/typeorm-base-entity";

/**
 * 默认实体排除列表
 */
export const DEFAULT_ENTITY_EXCLUDE_LIST = [
  'hasId',
  'setEntityName',
  'recover',
  'softRemove',
  'reload',
  'save',
] as Array<keyof TypeormBaseEntity>;
/**
 * 默认创建实体排除列表
 */
export const DEFAULT_CREATE_ENTITY_EXCLUDE_LIST = [
  ...DEFAULT_ENTITY_EXCLUDE_LIST,
  'id',
  'createdAt',
  'updatedAt',
  'deletedAt',
  'version',
] as Array<keyof TrackedTypeormBaseEntity>;
/**
* 默认更新实体排除列表
*/
export const DEFAULT_UPDATE_ENTITY_EXCLUDE_LIST = [
  ...DEFAULT_ENTITY_EXCLUDE_LIST,
  'id',
  'createdAt',
  'updatedAt',
  'deletedAt',
] as Array<keyof TypeormBaseEntity | 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>;
