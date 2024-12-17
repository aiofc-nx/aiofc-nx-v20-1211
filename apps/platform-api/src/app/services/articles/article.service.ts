import { Injectable } from '@nestjs/common';
import { BaseEntityService } from '@aiofc/service-base';
import { Article } from '@aiofc/entities';
import { ArticleRepository } from '../../repositories/articles/article.repository';
import { ClsService, ClsStore } from '@aiofc/nestjs-cls';

@Injectable()
export class ArticleService extends BaseEntityService<
  Article,
  'id',
  ArticleRepository
> {
  constructor(
    repository: ArticleRepository,
    private readonly cls: ClsService<ClsStore>
  ) {
    super(repository);
  }

  async createArticle(title: string, author: string, description: string) {
    const article = new Article();
    article.title = title;
    article.author = author;
    article.description = description;
    // 测试clsService是否能够获取到cls中的requestId
    const requestId = this.cls.get('requestId');
    console.log(`本次请求的ID已经在cls缓存：${requestId}`);

    return this.create(article);
  }
}
