import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Article, ArticleRole } from '../entities/article.entity';
import { CreateArticleDto } from '../dto/create-article.dto';
import { UpdateArticleDto } from '../dto/update-article.dto';
import { ArticleImage } from '../interfaces/article-image.interface';
import { CreateArticleInput } from '../interfaces/create-article-input.interface';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(Article)
    private articleRepository: Repository<Article>,
  ) {}

  async create(createArticleInput: CreateArticleInput): Promise<Article> {
    const article = new Article();

    // Set all fields with proper null handling
    article.title = createArticleInput.title;
    article.subTitle = createArticleInput.subTitle ?? null; // undefined -> null
    article.description = createArticleInput.description;
    article.role = createArticleInput.role || ArticleRole.CONTRIBUTOR;
    article.isPublished = createArticleInput.isPublished ?? true;
    article.publishedAt = article.isPublished ? new Date() : null;
    article.images = createArticleInput.images || [];
    article.views = 0;

    return await this.articleRepository.save(article);
  }

  async findAll(): Promise<Article[]> {
    return await this.articleRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findPublished(): Promise<Article[]> {
    return await this.articleRepository.find({
      where: { isPublished: true },
      order: {
        publishedAt: 'DESC',
      },
    });
  }

  async findOne(id: number): Promise<Article> {
    const article = await this.articleRepository.findOne({ where: { id } });
    if (!article) {
      throw new NotFoundException(`Article with ID ${id} not found`);
    }
    return article;
  }

  async update(
    id: number,
    updateData: UpdateArticleDto & { images?: ArticleImage[] },
  ): Promise<Article> {
    const article = await this.findOne(id);

    // Update fields with proper null handling
    if (updateData.title !== undefined) article.title = updateData.title;
    if (updateData.subTitle !== undefined)
      article.subTitle = updateData.subTitle ?? null;
    if (updateData.description !== undefined)
      article.description = updateData.description;
    if (updateData.role !== undefined) article.role = updateData.role;

    // Handle publish status change
    if (updateData.isPublished !== undefined) {
      article.isPublished = updateData.isPublished;
      // Set publishedAt when publishing for the first time
      if (updateData.isPublished && !article.publishedAt) {
        article.publishedAt = new Date();
      }
      // Clear publishedAt when unpublishing
      if (!updateData.isPublished) {
        article.publishedAt = null;
      }
    }

    if (updateData.images !== undefined) article.images = updateData.images;

    return await this.articleRepository.save(article);
  }

  async remove(id: number): Promise<void> {
    const article = await this.findOne(id);
    await this.articleRepository.remove(article);
  }

  async incrementViews(id: number): Promise<void> {
    await this.articleRepository.increment({ id }, 'views', 1);
  }

  async removeImage(
    articleId: number,
    imagePublicId: string,
  ): Promise<Article> {
    const article = await this.findOne(articleId);
    article.images = article.images.filter(
      (img) => img.publicId !== imagePublicId,
    );
    return await this.articleRepository.save(article);
  }
}
