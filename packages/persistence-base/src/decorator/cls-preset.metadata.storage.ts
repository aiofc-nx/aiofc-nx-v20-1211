import { PresetType } from './vo/preset-type';
import { TenantClsStore } from './vo/tenant-base-cls-store';

/**
 * 元数据字段接口
 *
 * 定义了实体预设元数据字段的结构:
 * - entityName: 实体名称
 * - entityPropertyName: 实体属性名
 * - clsStorageKey: CLS存储键,必须是CLS_STORAGE_TYPE中的键
 * - presetType: 预设类型,定义了预设值的应用场景
 */
export interface ClsPresetMetadataField<
  // CLS_STORAGE_TYPE 是一个泛型参数,它必须继承自 TenantClsStore
  // 这样可以确保存储类型包含租户相关的基础字段
  CLS_STORAGE_TYPE extends TenantClsStore,
> {
  entityName: string;
  entityPropertyName: string;
  clsStorageKey: keyof CLS_STORAGE_TYPE;
  presetType: PresetType;
}

/**
 * CLS预设元数据存储类
 *
 * 用于管理和存储实体预设元数据:
 * - metadataFields: 存储每个实体的元数据字段
 * - metadataFieldsForHierarchy: 缓存实体层次结构的元数据字段
 */
export class ClsPresetMetadataStorage<CLS_STORAGE_TYPE extends TenantClsStore> {
  private metadataFields: {
    [key: string]: ClsPresetMetadataField<CLS_STORAGE_TYPE>[];
  } = {};

  private metadataFieldsForHierarchy: {
    [key: string]: ClsPresetMetadataField<CLS_STORAGE_TYPE>[];
  } = {};

  /**
   * 添加元数据字段
   * 将字段添加到对应实体的元数据列表中
   */
  addField(field: ClsPresetMetadataField<CLS_STORAGE_TYPE>) {
    const fields = this.metadataFields[field.entityName] || [];
    fields.push(field);

    this.metadataFields[field.entityName] = fields;
  }

  /**
   * 获取实体层次结构的元数据字段
   *
   * @param topLevelEntity 顶层实体名称
   * @param entities 实体层次结构中的所有实体名称
   * @returns 所有相关实体的元数据字段数组
   */
  getMetadataFieldsByEntityHierarchy(
    topLevelEntity: string,
    entities: string[],
  ) {
    const result = this.metadataFieldsForHierarchy[topLevelEntity];

    if (result === undefined) {
      const fieldToAutoFill = entities.flatMap(
        (e) => this.metadataFields[e] || [],
      );

      this.metadataFieldsForHierarchy[topLevelEntity] = fieldToAutoFill;

      return fieldToAutoFill;
    }

    return result;
  }
}

/**
 * 默认的CLS元数据存储实例
 * 用于全局共享的元数据存储
 */
export const defaultClsMetadataStore = new ClsPresetMetadataStorage();
