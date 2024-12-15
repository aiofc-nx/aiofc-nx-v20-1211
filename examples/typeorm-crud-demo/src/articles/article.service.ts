import { Injectable } from '@nestjs/common';
import { BaseEntityService } from '@aiofc/service-base';
import { Article } from '@aiofc/entities';
import { ClsService, ClsStore } from '@aiofc/nestjs-cls';
import { ArticleRepository as Repository } from './article.repository';
import { FindOptionsWhere } from 'typeorm';
import { Transactional } from 'typeorm-transactional';

@Injectable()
export class ArticleService extends BaseEntityService<
  Article,
  'id',
  Repository
> {
  constructor(
    repository: Repository,
    private readonly cls: ClsService<ClsStore>
  ) {
    super(repository);
  }

  @Transactional()
  async findOne(id: string) {
    const where: FindOptionsWhere<Article> = {
      id,
    };
    return this.repository.findOne(where);
  }

  @Transactional()
  async findByTitle(title: string) {
    const where: FindOptionsWhere<Article> = {
      title,
      author: '吴承恩',
    };
    return this.repository.findOne(where);
  }

  @Transactional()
  async findByAuthor(author: string) {
    const where: FindOptionsWhere<Article> = {
      author,
    };
    return this.repository.findOne(where);
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
