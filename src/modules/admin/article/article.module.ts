import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticleAdminController } from './controllers/article-admin.controller';
import { ArticleService } from './services/article.service';
import { Article } from './entities/article.entity';
import { CloudinaryService } from '../../../shared/services/cloudinary.service';

@Module({
  imports: [TypeOrmModule.forFeature([Article])],
  controllers: [ArticleAdminController],
  providers: [ArticleService, CloudinaryService],
  exports: [ArticleService],
})
export class ArticleModule {}
