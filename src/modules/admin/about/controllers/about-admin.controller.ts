import {
  Controller,
  Post,
  Get,
  Put,
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
import { AboutService } from '../services/about.service';
import { CreateAboutDto } from '../dto/create-about.dto';
import { UpdateAboutDto } from '../dto/update-about.dto';
import { CloudinaryService } from '../../../../shared/services/cloudinary.service';
import { WebAuthGuard } from '../../auth/guards/web-auth.guard';
import { BaseController } from '../../../admin/base.controller';

@Controller('admin')
@UseGuards(WebAuthGuard)
export class AboutAdminController extends BaseController {
  constructor(
    private aboutService: AboutService,
    private cloudinaryService: CloudinaryService,
  ) {
    super();
    console.log('ProjectAdminController initialized');
  }

  // View about page
  @Get('about')
  @Render('admin/about')
  async getAboutView(
    @Req() req: any,
    @Query('success') success?: string,
    @Query('error') error?: string,
  ) {
    console.log('getAboutView called');
    try {
      const about = await this.aboutService.getAbout();

      return {
        title: 'About Management',
        currentPage: 'about',
        // user: { name: 'Admin User', role: 'admin' },
        user: this.getUserData(req),
        about: about,
        success: success || null,
        error: error || null,
      };
    } catch (error) {
      console.error('Error:', error);
      return {
        title: 'About Management',
        currentPage: 'about',
        // user: { name: 'Admin User', role: 'admin' },
        user: this.getUserData(req),
        about: null,
        success: null,
        error: error.message,
      };
    }
  }

  // Show edit form
  @Get('about/edit')
  @Render('admin/about-form')
  async editAboutForm(@Req() req: any) {
    try {
      const about = await this.aboutService.getAbout();
      return {
        title: 'Edit About',
        currentPage: 'about',
        // user: { name: 'Admin User', role: 'admin' },
        user: this.getUserData(req),
        isEdit: true,
        aboutData: about,
      };
    } catch (error) {
      return {
        title: 'Edit About',
        currentPage: 'about',
        // user: { name: 'Admin User', role: 'admin' },
        user: this.getUserData(req),
        isEdit: true,
        aboutData: {},
        error: 'About information not found',
      };
    }
  }

  // Update about
  @Post('about/update/:id')
  @UseInterceptors(FilesInterceptor('images', 10))
  async updateAbout(
    @Param('id') id: string,
    @Body() updateDto: UpdateAboutDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Res() res: Response,
  ) {
    try {
      console.log(`Updating about ${id}`);

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

      const existingAbout = await this.aboutService.getAbout();

      const aboutData: any = {};

      if (updateDto.title !== undefined) aboutData.title = updateDto.title;
      if (updateDto.subtitle !== undefined)
        aboutData.subtitle = updateDto.subtitle;
      if (updateDto.shortDescription !== undefined)
        aboutData.shortDescription = updateDto.shortDescription;
      if (updateDto.longDescription !== undefined)
        aboutData.longDescription = updateDto.longDescription;
      if (updateDto.missionStatement !== undefined)
        aboutData.missionStatement = updateDto.missionStatement;
      if (updateDto.visionStatement !== undefined)
        aboutData.visionStatement = updateDto.visionStatement;
      if (updateDto.coreValues !== undefined)
        aboutData.coreValues = updateDto.coreValues;
      if (updateDto.icon !== undefined) aboutData.icon = updateDto.icon;
      if (updateDto.videoUrl !== undefined)
        aboutData.videoUrl = updateDto.videoUrl;
      if (updateDto.brochureUrl !== undefined)
        aboutData.brochureUrl = updateDto.brochureUrl;

      if (updateDto.isActive !== undefined) {
        if (typeof updateDto.isActive === 'boolean') {
          aboutData.isActive = updateDto.isActive;
        } else if (typeof updateDto.isActive === 'string') {
          aboutData.isActive = updateDto.isActive === 'true';
        }
      }

      if (updateDto.socialLinks) {
        aboutData.socialLinks =
          typeof updateDto.socialLinks === 'string'
            ? JSON.parse(updateDto.socialLinks)
            : updateDto.socialLinks;
      }

      if (updateDto.teamMembers) {
        aboutData.teamMembers =
          typeof updateDto.teamMembers === 'string'
            ? JSON.parse(updateDto.teamMembers)
            : updateDto.teamMembers;
      }

      if (updateDto.milestones) {
        aboutData.milestones =
          typeof updateDto.milestones === 'string'
            ? JSON.parse(updateDto.milestones)
            : updateDto.milestones;
      }

      if (uploadedImages.length > 0) {
        aboutData.images = [...(existingAbout.images || []), ...uploadedImages];
      }

      await this.aboutService.update(Number(id), aboutData);
      return res.redirect(
        '/admin/about?success=About information updated successfully',
      );
    } catch (error) {
      console.error(`Error updating about:`, error);
      return res.redirect(
        '/admin/about?error=' + encodeURIComponent(error.message),
      );
    }
  }

  // Delete single image
  @Post('about/images/delete/:aboutId/:imagePublicId')
  async deleteImage(
    @Param('aboutId') aboutId: string,
    @Param('imagePublicId') imagePublicId: string,
    @Res() res: Response,
  ) {
    try {
      await this.cloudinaryService.deleteFile(imagePublicId);
      await this.aboutService.removeImage(Number(aboutId), imagePublicId);
      return res.redirect('/admin/about?success=Image deleted successfully');
    } catch (error) {
      return res.redirect(
        '/admin/about?error=' + encodeURIComponent(error.message),
      );
    }
  }

  // Social Links Management
  @Post('about/social/add/:aboutId')
  async addSocialLink(
    @Param('aboutId') aboutId: string,
    @Body() socialLink: any,
    @Res() res: Response,
  ) {
    try {
      await this.aboutService.addSocialLink(Number(aboutId), socialLink);
      return res.redirect(
        '/admin/about?success=Social link added successfully',
      );
    } catch (error) {
      return res.redirect(
        '/admin/about?error=' + encodeURIComponent(error.message),
      );
    }
  }

  @Post('about/social/remove/:aboutId/:platform')
  async removeSocialLink(
    @Param('aboutId') aboutId: string,
    @Param('platform') platform: string,
    @Res() res: Response,
  ) {
    try {
      await this.aboutService.removeSocialLink(Number(aboutId), platform);
      return res.redirect(
        '/admin/about?success=Social link removed successfully',
      );
    } catch (error) {
      return res.redirect(
        '/admin/about?error=' + encodeURIComponent(error.message),
      );
    }
  }
}
