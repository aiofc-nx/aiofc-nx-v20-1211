import { Controller, Get } from '@nestjs/common';
import { AppService } from '../services';
import { ArticleService } from '../services';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly articleService: ArticleService
  ) {}

  @Get()
  getData() {
    return this.appService.getData();
  }

  // @Get('test')
  // test() {
  //   const article = this.articleService.findById(2);
  //   return article;
  // }
}
