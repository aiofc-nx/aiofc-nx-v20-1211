import { ClsService } from '@aiofc/nestjs-cls';
import { defaultClsMetadataStore, PresetType, TenantClsStore } from '@aiofc/persistence-base';
import { Injectable } from '@nestjs/common';
import {
  DataSource,
  EntitySubscriberInterface,
  InsertEvent,
  UpdateEvent,
} from 'typeorm';


/**
 * CLS预设订阅器
 *
 * 该类用于在实体插入和更新时自动预设CLS中的值:
 * 1. 实现EntitySubscriberInterface接口以订阅实体事件
 * 2. 通过泛型参数ClsStoreType指定CLS存储类型
 * 3. 在构造函数中注册到数据源的订阅器列表
 */
@Injectable()
export class ClsPresetSubscriber<ClsStoreType extends TenantClsStore>
  implements EntitySubscriberInterface
{
  /**
   * 构造函数
   * @param dataSource - TypeORM数据源
   * @param clsService - CLS服务实例
   */
  constructor(
    private readonly dataSource: DataSource,
    private readonly clsService: ClsService<ClsStoreType>,
  ) {
    this.dataSource.subscribers.push(this);
  }

  /**
   * 实体插入前的处理方法
   *
   * 在实体插入数据库前调用,用于预设CLS值:
   * 1. 检查实体是否存在
   * 2. 调用handleEntityChangeEvent处理实体变更
   */
  beforeInsert(event: InsertEvent<any>): Promise<any> | undefined {
    /* istanbul ignore next */
    if (event.entity === undefined) {
      return;
    }

    return this.handleEntityChangeEvent(
      event.metadata.inheritanceTree,
      event.entity,
      PresetType.INSERT,
    );
  }

  /**
   * 实体更新前的处理方法
   *
   * 在实体更新前调用,用于预设CLS值:
   * 1. 检查实体是否存在
   * 2. 调用handleEntityChangeEvent处理实体变更
   */
  beforeUpdate(event: UpdateEvent<any>) {
    /* istanbul ignore next */
    if (event.entity === undefined) {
      return;
    }

    return this.handleEntityChangeEvent(
      event.metadata.inheritanceTree,
      event.entity,
      PresetType.UPDATE,
    );
  }

  /**
   * 处理实体变更事件的私有方法
   *
   * 该方法实现了CLS值的自动预设逻辑:
   * 1. 获取实体继承层次结构
   * 2. 从元数据存储中获取需要预设的字段
   * 3. 根据预设类型和当前值判断是否需要预设
   * 4. 从CLS中获取值并设置到实体中
   *
   * @param inheritanceTree - 实体的继承树
   * @param entity - 要处理的实体实例
   * @param presetType - 预设类型(插入或更新)
   * @returns 处理后的实体
   */
  private handleEntityChangeEvent(
    inheritanceTree: Function[],
    entity: any,
    presetType: PresetType,
  ) {
    const topLevelEntity = inheritanceTree[0].name;
    const entityHierarchy = inheritanceTree.map((e) => e.name);

    const metadataFields =
      defaultClsMetadataStore.getMetadataFieldsByEntityHierarchy(
        topLevelEntity,
        entityHierarchy,
      );

    for (const field of metadataFields) {
      if (
        field.presetType === PresetType.ALL ||
        presetType === field.presetType
      ) {
        const currentValue = entity[field.entityPropertyName];
        // 仅在值未提供时设置
        if (currentValue === null || currentValue === undefined) {
          entity[field.entityPropertyName] =
            this.clsService.get()[field.clsStorageKey];
        }
      }
    }

    return entity;
  }
}
