import { Body, Controller, Get, Post, Param } from '@nestjs/common';
import { Article } from '@aiofc/entities';
import { ArticleCreateDto } from './dto/article-create.dto';
import { ArticleService } from './article.service';

@Controller('article')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Get('findAll')
  findAll() {
    return this.articleService.findAll();
  }

  @Post('createArticle')
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

  @Get('title/:title')
  async findByTitle(@Param('title') title: string) {
    return this.articleService.findByTitle(title);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.articleService.findOne(id);
  }
}
