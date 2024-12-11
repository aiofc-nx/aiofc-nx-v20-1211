import { Body, Controller, Get, Post } from '@nestjs/common';
import { ArticleService } from '../../services/articles/article.service';
import { Article } from '@aiofc/entities';
import { ArticleCreateDto } from './dto/article-create.dto';

@Controller('article')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Get()
  findAll() {
    return this.articleService.findAll();
  }

  @Post('create1')
  createArticle(@Body() dto: ArticleCreateDto) {
    const { title, author, description } = dto;
    // const title = '《现代计算机架构》';
    // const author = '约翰·冯·诺伊曼';
    // const summary =
    //   '《博弈论》是一部由约翰·冯·诺伊曼和奥斯卡·摩根斯特恩合著的关于博弈论的经典著作。';
    return this.articleService.createArticle(title, author, description);
  }

  @Post('create')
  create() {
    const article = new Article();
    article.title = '《现代计算机架构》';
    article.author = '约翰·冯·诺伊曼';
    article.description =
      '《博弈论》是一部由约翰·冯·诺伊曼和奥斯卡·摩根斯特恩合著的关于博弈论的经典著作。';
    return this.articleService.create(article);
  }
}
