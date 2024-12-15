import { IsNotEmpty, IsString, Length } from 'class-validator';

export class ArticleCreateDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  author: string;

  @IsString()
  @IsNotEmpty()
  @Length(10, 100, { message: '长度不够，多写几个字行不行！？' })
  description: string;
}
