import { Module } from '@nestjs/common';
import { ArticleController } from './article.controller';
import { ArticleService } from './article.service';
import { Article } from '@aiofc/entities';
import { TypeOrmModule } from '@aiofc/nestjs-typeorm';
import { ArticleRepository } from './article.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Article])],
  controllers: [ArticleController],
  providers: [ArticleService, ArticleRepository],
})
export class ArticleModule {}
