import { DataSource } from 'typeorm';
import { InjectDataSource } from '@aiofc/nestjs-typeorm';
import { TrackedTypeormRepository as BaseRepository } from '@aiofc/typeorm';
import { Injectable } from '@nestjs/common';
import { Article } from '@aiofc/entities';

@Injectable()
export class ArticleRepository extends BaseRepository<Article, 'id'> {
  /*
  如果我们这里不写这个构造函数，那么会报错：提示这个类不能作为Nest的Provider使用。
  而作为派生类，必须包含 "super" 调用，这个super()调用会调用父类的构造函数。
  父类BaseTypeormTrackedEntityRepository的构造函数：
  protected constructor(
    entityTarget: ObjectType<ENTITY>,
    dataSource: DataSource,
    idFieldName: ID,
  ) {
    super(entityTarget, dataSource, idFieldName);
  }
  */
  constructor(
    @InjectDataSource()
    ds: DataSource
  ) {
    super(Article, ds, 'id');
  }
}
