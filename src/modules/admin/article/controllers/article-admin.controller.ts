import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Render,
  Query,
  Res,
  Req,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { ArticleService } from '../services/article.service';
import { CreateArticleDto } from '../dto/create-article.dto';
import { UpdateArticleDto } from '../dto/update-article.dto';
import { CloudinaryService } from '../../../../shared/services/cloudinary.service';
import { WebAuthGuard } from '../../auth/guards/web-auth.guard';
import { BaseController } from '../../../admin/base.controller';

@Controller('admin')
@UseGuards(WebAuthGuard)
export class ArticleAdminController extends BaseController {
  constructor(
    private articleService: ArticleService,
    private cloudinaryService: CloudinaryService,
  ) {
    super();
    console.log('✅ ProjectAdminController initialized');
  }

  // List all articles
  @Get('articles')
  @Render('admin/articles')
  async getArticlesView(
    @Req() req: any,
    @Query('success') success?: string,
    @Query('error') error?: string,
  ) {
    console.log('getArticlesView called');
    try {
      const articles = await this.articleService.findAll();

      return {
        title: 'Articles Management',
        currentPage: 'articles',
        // user: { name: 'Admin User', role: 'admin' },
        user: this.getUserData(req),
        articles: articles || [],
        success: success || null,
        error: error || null,
      };
    } catch (error) {
      console.error('Error:', error);
      return {
        title: 'Articles Management',
        currentPage: 'articles',
        // user: { name: 'Admin User', role: 'admin' },
        user: this.getUserData(req),
        articles: [],
        success: null,
        error: error.message,
      };
    }
  }

  // Show create form
  @Get('articles/create')
  @Render('admin/article-form')
  createArticleForm(@Req() req: any) {
    return {
      title: 'Create Article',
      currentPage: 'articles',
      // user: { name: 'Admin User', role: 'admin' },
      user: this.getUserData(req),
      isEdit: false,
      articleData: {},
    };
  }

  // Show edit form
  @Get('articles/edit/:id')
  @Render('admin/article-form')
  async editArticleForm(@Param('id') id: string, @Req() req: any) {
    try {
      const article = await this.articleService.findOne(Number(id));
      return {
        title: 'Edit Article',
        currentPage: 'articles',
        // user: { name: 'Admin User', role: 'admin' },
        user: this.getUserData(req),
        isEdit: true,
        articleData: article,
      };
    } catch (error) {
      return {
        title: 'Edit Article',
        currentPage: 'articles',
        // user: { name: 'Admin User', role: 'admin' },
        user: this.getUserData(req),
        isEdit: true,
        articleData: {},
        error: 'Article not found',
      };
    }
  }

  // View single article
  @Get('articles/view/:id')
  @Render('admin/article-view')
  async viewArticle(@Param('id') id: string, @Req() req: any) {
    try {
      const article = await this.articleService.findOne(Number(id));
      return {
        title: 'View Article',
        currentPage: 'articles',
        // user: { name: 'Admin User', role: 'admin' },
        user: this.getUserData(req),
        articleData: article,
      };
    } catch (error) {
      return {
        title: 'View Article',
        currentPage: 'articles',
        // user: { name: 'Admin User', role: 'admin' },
        user: this.getUserData(req),
        articleData: {},
        error: 'Article not found',
      };
    }
  }

  // Create article
  @Post('articles')
  @UseInterceptors(FilesInterceptor('images', 10))
  async createArticle(
    @Body() createArticleDto: CreateArticleDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Res() res: Response,
  ) {
    console.log('Creating article');
    try {
      let images: Array<{ url: string; publicId: string; fileName: string }> =
        [];

      if (files?.length) {
        const uploadPromises = files.map(async (file) => {
          const result = await this.cloudinaryService.uploadFile(file);
          return {
            url: result.secure_url,
            publicId: result.public_id,
            fileName: file.originalname,
          };
        });
        images = await Promise.all(uploadPromises);
      }

      // Handle isPublished conversion
      let isPublished = true;
      if (createArticleDto.isPublished !== undefined) {
        if (typeof createArticleDto.isPublished === 'boolean') {
          isPublished = createArticleDto.isPublished;
        } else if (typeof createArticleDto.isPublished === 'string') {
          isPublished = createArticleDto.isPublished === 'true';
        }
      }

      const articleData = {
        title: createArticleDto.title,
        subTitle: createArticleDto.subTitle,
        description: createArticleDto.description,
        role: createArticleDto.role,
        isPublished: isPublished,
        images: images,
      };

      await this.articleService.create(articleData);
      return res.redirect(
        '/admin/articles?success=Article created successfully',
      );
    } catch (error) {
      console.error('Error creating article:', error);
      return res.redirect(
        '/admin/articles?error=' + encodeURIComponent(error.message),
      );
    }
  }

  // Update article
  @Post('articles/update/:id')
  @UseInterceptors(FilesInterceptor('images', 10))
  async updateArticle(
    @Param('id') id: string,
    @Body() updateArticleDto: UpdateArticleDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Res() res: Response,
  ) {
    try {
      console.log(`Updating article ${id}`);

      const uploadedImages: Array<{
        url: string;
        publicId: string;
        fileName: string;
      }> = [];

      if (files && files.length > 0) {
        for (const file of files) {
          try {
            const result = await this.cloudinaryService.uploadFile(file);
            uploadedImages.push({
              url: result.secure_url,
              publicId: result.public_id,
              fileName: file.originalname,
            });
          } catch (uploadError) {
            console.error('Error uploading image:', uploadError);
          }
        }
      }

      const existingArticle = await this.articleService.findOne(Number(id));

      // Prepare update data
      const articleData: any = {};

      if (updateArticleDto.title !== undefined)
        articleData.title = updateArticleDto.title;
      if (updateArticleDto.subTitle !== undefined)
        articleData.subTitle = updateArticleDto.subTitle;
      if (updateArticleDto.description !== undefined)
        articleData.description = updateArticleDto.description;
      if (updateArticleDto.role !== undefined)
        articleData.role = updateArticleDto.role;

      // Handle isPublished conversion
      if (updateArticleDto.isPublished !== undefined) {
        if (typeof updateArticleDto.isPublished === 'boolean') {
          articleData.isPublished = updateArticleDto.isPublished;
        } else if (typeof updateArticleDto.isPublished === 'string') {
          articleData.isPublished = updateArticleDto.isPublished === 'true';
        }
      }

      if (uploadedImages.length > 0) {
        articleData.images = [
          ...(existingArticle.images || []),
          ...uploadedImages,
        ];
      }

      await this.articleService.update(Number(id), articleData);
      return res.redirect(
        '/admin/articles?success=Article updated successfully',
      );
    } catch (error) {
      console.error(`Error updating article ${id}:`, error);
      return res.redirect(
        '/admin/articles?error=' + encodeURIComponent(error.message),
      );
    }
  }

  // Delete article
  @Post('articles/delete/:id')
  async deleteArticle(@Param('id') id: string, @Res() res: Response) {
    try {
      console.log(`Deleting article ${id}`);

      const article = await this.articleService.findOne(Number(id));

      // Delete images from Cloudinary
      if (article.images && article.images.length > 0) {
        for (const image of article.images) {
          try {
            await this.cloudinaryService.deleteFile(image.publicId);
          } catch (cloudinaryError) {
            console.error(`Error deleting image:`, cloudinaryError);
          }
        }
      }

      await this.articleService.remove(Number(id));
      return res.redirect(
        '/admin/articles?success=Article deleted successfully',
      );
    } catch (error) {
      console.error(`Error deleting article ${id}:`, error);
      return res.redirect(
        '/admin/articles?error=' + encodeURIComponent(error.message),
      );
    }
  }

  // Delete single image
  @Delete('articles/images/:articleId/:imagePublicId')
  async deleteImage(
    @Param('articleId') articleId: string,
    @Param('imagePublicId') imagePublicId: string,
    @Res() res: Response,
  ) {
    try {
      await this.cloudinaryService.deleteFile(imagePublicId);
      await this.articleService.removeImage(Number(articleId), imagePublicId);
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }
}
