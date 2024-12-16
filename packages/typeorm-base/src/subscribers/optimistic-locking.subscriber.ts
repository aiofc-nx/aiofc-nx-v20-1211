import { Injectable } from '@nestjs/common';
import { OptimisticLockException } from '@aiofc/exceptions';
import { DataSource, EntitySubscriberInterface, UpdateEvent } from 'typeorm';

@Injectable()
/**
 * 乐观锁订阅器
 *
 * 该类用于实现乐观锁机制:
 * 1. 仅适用于save方法,不适用于update方法
 * 2. 通过版本号检查来防止并发更新冲突
 * 3. 在更新前验证版本号是否匹配
 */
export class OptimisticLockingSubscriber implements EntitySubscriberInterface {
  /**
   * 构造函数
   *
   * @param dataSource - TypeORM数据源
   * 将订阅器注册到数据源的订阅器列表中
   */
  constructor(readonly dataSource: DataSource) {
    dataSource.subscribers.push(this);
  }

  /**
   * 实体更新前的处理方法
   *
   * 实现乐观锁检查逻辑:
   * 1. 检查实体是否定义了版本列
   * 2. 比较更新请求中的版本号和数据库中的版本号
   * 3. 如果版本号不匹配,则抛出乐观锁异常
   *
   * @param event - 更新事件对象,包含实体元数据和版本信息
   * @throws OptimisticLockException 当版本号不匹配时
   */
  beforeUpdate(event: UpdateEvent<any>) {
    // 检查实体是否有版本列,以及事件中是否包含必要的实体信息
    if (event.metadata.versionColumn && event.entity && event.databaseEntity) {
      // 获取更新请求中的版本号
      const versionFromUpdate = Reflect.get(
        event.entity,
        event.metadata.versionColumn.propertyName,
      );

      // 获取数据库中的当前版本号
      const versionFromDatabase =
        event.databaseEntity[event.metadata.versionColumn.propertyName];

      // 比较版本号,如果不匹配则表示数据已被其他操作更新
      if (versionFromDatabase !== versionFromUpdate) {
        throw new OptimisticLockException(versionFromDatabase);
      }
    }
  }
}
