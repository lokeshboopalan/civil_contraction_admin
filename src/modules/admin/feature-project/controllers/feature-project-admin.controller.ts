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
import { FeatureProjectService } from '../services/feature-project.service';
import { CreateFeatureProjectDto } from '../dto/create-feature-project.dto';
import { UpdateFeatureProjectDto } from '../dto/update-feature-project.dto';
import { CloudinaryService } from '../../../../shared/services/cloudinary.service';
import { WebAuthGuard } from '../../auth/guards/web-auth.guard';
import { BaseController } from '../../../admin/base.controller';

@Controller('admin')
@UseGuards(WebAuthGuard)
export class FeatureProjectAdminController extends BaseController {
  constructor(
    private featureProjectService: FeatureProjectService,
    private cloudinaryService: CloudinaryService,
  ) {
    super();
    console.log('ProjectAdminController initialized');
  }

  // List all feature projects
  @Get('feature-projects')
  @Render('admin/feature-projects')
  async getFeatureProjectsView(
    @Req() req: any,
    @Query('success') success?: string,
    @Query('error') error?: string,
  ) {
    console.log('getFeatureProjectsView called');
    try {
      const projects = await this.featureProjectService.findAll();

      return {
        title: 'Feature Projects Management',
        currentPage: 'feature-projects',
        // user: { name: 'Admin User', role: 'admin' },
        user: this.getUserData(req),
        projects: projects || [],
        success: success || null,
        error: error || null,
      };
    } catch (error) {
      console.error('Error:', error);
      return {
        title: 'Feature Projects Management',
        currentPage: 'feature-projects',
        // user: { name: 'Admin User', role: 'admin' },
        user: this.getUserData(req),
        projects: [],
        success: null,
        error: error.message,
      };
    }
  }

  // Show create form
  @Get('feature-projects/create')
  @Render('admin/feature-project-form')
  createFeatureProjectForm(@Req() req: any) {
    return {
      title: 'Create Feature Project',
      currentPage: 'feature-projects',
      // user: { name: 'Admin User', role: 'admin' },
      user: this.getUserData(req),
      isEdit: false,
      projectData: {},
    };
  }

  // Show edit form
  @Get('feature-projects/edit/:id')
  @Render('admin/feature-project-form')
  async editFeatureProjectForm(@Param('id') id: string, @Req() req: any) {
    try {
      const project = await this.featureProjectService.findOne(Number(id));
      return {
        title: 'Edit Feature Project',
        currentPage: 'feature-projects',
        // user: { name: 'Admin User', role: 'admin' },
        user: this.getUserData(req),
        isEdit: true,
        projectData: project,
      };
    } catch (error) {
      return {
        title: 'Edit Feature Project',
        currentPage: 'feature-projects',
        // user: { name: 'Admin User', role: 'admin' },
        user: this.getUserData(req),
        isEdit: true,
        projectData: {},
        error: 'Feature project not found',
      };
    }
  }

  // View single feature project
  @Get('feature-projects/view/:id')
  @Render('admin/feature-project-view')
  async viewFeatureProject(@Param('id') id: string, @Req() req: any) {
    try {
      const project = await this.featureProjectService.findOne(Number(id));
      return {
        title: 'View Feature Project',
        currentPage: 'feature-projects',
        // user: { name: 'Admin User', role: 'admin' },
        user: this.getUserData(req),
        projectData: project,
      };
    } catch (error) {
      return {
        title: 'View Feature Project',
        currentPage: 'feature-projects',
        // user: { name: 'Admin User', role: 'admin' },
        user: this.getUserData(req),
        projectData: {},
        error: 'Feature project not found',
      };
    }
  }

  // Create feature project
  @Post('feature-projects')
  @UseInterceptors(FilesInterceptor('images', 10))
  async createFeatureProject(
    @Body() createDto: CreateFeatureProjectDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Res() res: Response,
  ) {
    console.log('Creating feature project');
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

      // Handle boolean conversion for isActive
      let isActive = true;
      if (createDto.isActive !== undefined) {
        if (typeof createDto.isActive === 'boolean') {
          isActive = createDto.isActive;
        } else if (typeof createDto.isActive === 'string') {
          isActive = createDto.isActive === 'true';
        }
      }

      const projectData = {
        title: createDto.title,
        description: createDto.description,
        location: createDto.location,
        startDate: createDto.startDate,
        endDate: createDto.endDate,
        status: createDto.status,
        isActive: isActive,
        sortOrder: createDto.sortOrder ? Number(createDto.sortOrder) : 0,
        images: images,
      };

      await this.featureProjectService.create(projectData);
      return res.redirect(
        '/admin/feature-projects?success=Feature project created successfully',
      );
    } catch (error) {
      console.error('Error creating feature project:', error);
      return res.redirect(
        '/admin/feature-projects?error=' + encodeURIComponent(error.message),
      );
    }
  }

  // Update feature project
  @Post('feature-projects/update/:id')
  @UseInterceptors(FilesInterceptor('images', 10))
  async updateFeatureProject(
    @Param('id') id: string,
    @Body() updateDto: UpdateFeatureProjectDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Res() res: Response,
  ) {
    try {
      console.log(`Updating feature project ${id}`);

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

      const existingProject = await this.featureProjectService.findOne(
        Number(id),
      );

      // Prepare update data
      const projectData: any = {};

      if (updateDto.title !== undefined) projectData.title = updateDto.title;
      if (updateDto.description !== undefined)
        projectData.description = updateDto.description;
      if (updateDto.location !== undefined)
        projectData.location = updateDto.location;
      if (updateDto.startDate !== undefined)
        projectData.startDate = updateDto.startDate;
      if (updateDto.endDate !== undefined)
        projectData.endDate = updateDto.endDate;
      if (updateDto.status !== undefined) projectData.status = updateDto.status;
      if (updateDto.sortOrder !== undefined)
        projectData.sortOrder = Number(updateDto.sortOrder);

      // Handle isActive conversion
      if (updateDto.isActive !== undefined) {
        if (typeof updateDto.isActive === 'boolean') {
          projectData.isActive = updateDto.isActive;
        } else if (typeof updateDto.isActive === 'string') {
          projectData.isActive = updateDto.isActive === 'true';
        }
      }

      if (uploadedImages.length > 0) {
        projectData.images = [
          ...(existingProject.images || []),
          ...uploadedImages,
        ];
      }

      await this.featureProjectService.update(Number(id), projectData);
      return res.redirect(
        '/admin/feature-projects?success=Feature project updated successfully',
      );
    } catch (error) {
      console.error(`Error updating feature project ${id}:`, error);
      return res.redirect(
        '/admin/feature-projects?error=' + encodeURIComponent(error.message),
      );
    }
  }

  // Delete feature project
  @Post('feature-projects/delete/:id')
  async deleteFeatureProject(@Param('id') id: string, @Res() res: Response) {
    try {
      console.log(`Deleting feature project ${id}`);

      const project = await this.featureProjectService.findOne(Number(id));

      // Delete images from Cloudinary
      if (project.images && project.images.length > 0) {
        for (const image of project.images) {
          try {
            await this.cloudinaryService.deleteFile(image.publicId);
          } catch (cloudinaryError) {
            console.error(`Error deleting image:`, cloudinaryError);
          }
        }
      }

      await this.featureProjectService.remove(Number(id));
      return res.redirect(
        '/admin/feature-projects?success=Feature project deleted successfully',
      );
    } catch (error) {
      console.error(`Error deleting feature project ${id}:`, error);
      return res.redirect(
        '/admin/feature-projects?error=' + encodeURIComponent(error.message),
      );
    }
  }

  // Toggle active status
  @Post('feature-projects/toggle/:id')
  async toggleActive(@Param('id') id: string, @Res() res: Response) {
    try {
      await this.featureProjectService.toggleActive(Number(id));
      return res.redirect(
        '/admin/feature-projects?success=Feature project status updated',
      );
    } catch (error) {
      return res.redirect(
        '/admin/feature-projects?error=' + encodeURIComponent(error.message),
      );
    }
  }

  // Delete single image
  @Delete('feature-projects/images/:projectId/:imagePublicId')
  async deleteImage(
    @Param('projectId') projectId: string,
    @Param('imagePublicId') imagePublicId: string,
    @Res() res: Response,
  ) {
    try {
      await this.cloudinaryService.deleteFile(imagePublicId);
      await this.featureProjectService.removeImage(
        Number(projectId),
        imagePublicId,
      );
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }
}
