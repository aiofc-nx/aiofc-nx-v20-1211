import { defaultClsMetadataStore, PresetType, TenantClsStore } from '@aiofc/persistence-base';
import { getMetadataArgsStorage } from 'typeorm';
import { TrackedTypeormBaseEntity } from '../../entity/tracked-typeorm-base-entity';


/**
 * CLS预设装饰器选项接口
 *
 * 该接口定义了CLS预设装饰器所需的配置选项:
 *
 * 泛型参数:
 * - CLS_STORE: CLS存储类型,必须继承自TenantClsStore
 *
 * 属性说明:
 * - clsFieldName: CLS存储中的字段名
 *   - 类型为CLS_STORE的键名
 *   - 用于指定要预设的CLS字段
 *
 * - presetType: 预设类型(可选)
 *   - 类型为PresetType枚举
 *   - 用于控制预设行为的触发时机
 *   - 默认为undefined
 */
interface ClsPresetDecoratorOptions<CLS_STORE extends TenantClsStore> {
  clsFieldName: keyof CLS_STORE;
  presetType?: PresetType;
}

/**
 * CLS预设装饰器函数
 *
 * 该装饰器用于将实体属性与CLS存储关联:
 * 1. 泛型参数:
 *    - CLS_STORE: CLS存储类型,必须继承自TenantClsStore
 *
 * 2. 参数说明:
 *    - options: CLS预设装饰器配置选项
 *      - clsFieldName: CLS存储中的字段名
 *      - presetType: 预设类型(可选)
 *
 * 3. 实现细节:
 *    - 返回装饰器函数,接收目标对象和属性名
 *    - 验证目标对象必须是TrackedTypeormBaseEntity的实例
 *    - 从TypeORM元数据中查找属性定义
 *    - 将字段信息添加到defaultClsMetadataStore中
 *
 * 4. 错误处理:
 *    - 如果目标对象类型错误,抛出TypeError
 *    - 如果找不到属性定义,抛出错误信息
 */
export function ClsPreset<CLS_STORE extends TenantClsStore>(
  options: ClsPresetDecoratorOptions<CLS_STORE>,
): Function {
  return function (object: object, propertyName: string) {
    // 获取TypeORM元数据存储
    const metadataArgsStorage = getMetadataArgsStorage();

    // 验证目标对象类型
    if (!(object instanceof TrackedTypeormBaseEntity)) {
      throw new TypeError(
        `Cls Preset functionality is available only for instances of BaseEntityHelper class`,
      );
    }

    // 获取实体类名
    const entityName = object.constructor.name;

    // 查找属性定义
    const foundProperty = metadataArgsStorage.columns.find(
      (c) => c.propertyName === propertyName,
    );

    /* istanbul ignore next */
    if (foundProperty === undefined) {
      // 如果找不到属性定义则抛出错误
      throw `Can not find a property for cls preset functionality. Trying to find ${propertyName}, available properties: [${metadataArgsStorage.columns
        .map((c) => c.propertyName)
        .join(',')}]`;
    }

    // 将字段信息添加到CLS元数据存储中
    defaultClsMetadataStore.addField({
      entityPropertyName: propertyName,
      entityName,
      clsStorageKey: options.clsFieldName as symbol,
      presetType: options.presetType ?? PresetType.ALL,
    });
  };
}
