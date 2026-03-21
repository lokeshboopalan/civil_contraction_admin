import { ArticleRole } from '../entities/article.entity';
import { ArticleImage } from './article-image.interface';

export interface CreateArticleInput {
  title: string;
  subTitle?: string;
  description: string;
  role?: ArticleRole;
  isPublished?: boolean;
  images: ArticleImage[];
}
