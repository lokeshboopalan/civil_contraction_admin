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
  HttpException,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { ProjectsService } from '../services/project.service';
import { CreateProjectDto } from '../dto/create-project.dto';
import { UpdateProjectDto } from '../dto/update-project.dto';
import { BaseController } from '../../../admin/base.controller';
import { CloudinaryService } from '../../../../shared/services/cloudinary.service';
import { WebAuthGuard } from '../../auth/guards/web-auth.guard';

@Controller('admin')
@UseGuards(WebAuthGuard)
export class ProjectAdminController extends BaseController {
  constructor(
    private projectsService: ProjectsService,
    private cloudinaryService: CloudinaryService,
  ) {
    super();
    console.log('ProjectAdminController initialized');
  }

  // FIXED: Changed from @Get('list') to @Get('projects')
  @Get('projects/list')
  @Render('admin/projects')
  async getProjectsView(
    @Req() req: any,
    @Query('status') status?: string,
    @Query('success') success?: string,
    @Query('error') error?: string,
  ) {
    console.log('getProjectsView called at /admin/projects');
    try {
      const projects = await this.projectsService.findAll();
      console.log('Projects from database:', projects);

      return {
        title: 'Projects Management',
        currentPage: 'projects',
        // user: { name: 'Admin User', role: 'admin' },
        user: this.getUserData(req),
        projects: projects || [],
        success: success || null,
        error: error || null,
        stats: {
          total: projects?.length || 0,
          ongoing: projects?.filter((p) => p.status === 'ongoing').length || 0,
          completed:
            projects?.filter((p) => p.status === 'completed').length || 0,
        },
        currentFilter: status || 'all',
      };
    } catch (error) {
      console.error('Error:', error);
      return {
        title: 'Projects Management',
        currentPage: 'projects',
        // user: { name: 'Admin User', role: 'admin' },
        user: this.getUserData(req),
        projects: [],
        success: null,
        error: error.message,
        stats: { total: 0, ongoing: 0, completed: 0 },
        currentFilter: status || 'all',
      };
    }
  }

  @Get('projects/create')
  @Render('admin/project-form')
  createProjectForm(@Req() req: Request) {
    console.log('Create project form requested');
    return {
      title: 'Create Project',
      currentPage: 'projects',
      // user: { name: 'Admin User', role: 'admin' },
      user: this.getUserData(req),
      isEdit: false,
      projectData: {},
    };
  }

  @Get('projects/edit/:id')
  @Render('admin/project-form')
  async editProjectForm(@Param('id') id: string, @Req() req: Request) {
    try {
      console.log(`Edit project form requested for ID: ${id}`);
      const project = await this.projectsService.findOne(Number(id));
      return {
        title: 'Edit Project',
        currentPage: 'projects',
        // user: { name: 'Admin User', role: 'admin' },
        user: this.getUserData(req),
        isEdit: true,
        projectData: project,
      };
    } catch (error) {
      return {
        title: 'Edit Project',
        currentPage: 'projects',
        // user: { name: 'Admin User', role: 'admin' },
        user: this.getUserData(req),
        isEdit: true,
        projectData: {},
        error: 'Project not found',
      };
    }
  }

  @Get('projects/view/:id')
  @Render('admin/project-view')
  async viewProject(@Param('id') id: string, @Req() req: Request) {
    try {
      console.log(`View project requested for ID: ${id}`);
      const project = await this.projectsService.findOne(Number(id));
      return {
        title: 'View Project',
        currentPage: 'projects',
        // user: { name: 'Admin User', role: 'admin' },
        user: this.getUserData(req),
        projectData: project,
      };
    } catch (error) {
      return {
        title: 'View Project',
        currentPage: 'projects',
        // user: { name: 'Admin User', role: 'admin' },
        user: this.getUserData(req),
        projectData: {},
        error: 'Project not found',
      };
    }
  }

  @Post('projects')
  @UseInterceptors(FilesInterceptor('images', 10))
  async createProject(
    @Body() createProjectDto: CreateProjectDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Res() res: Response,
  ) {
    console.log('API - Create project');
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

      const projectData = {
        title: createProjectDto.title,
        description: createProjectDto.description,
        location: createProjectDto.location,
        startDate: createProjectDto.startDate,
        endDate: createProjectDto.endDate,
        status: createProjectDto.status,
        images: images,
      };

      await this.projectsService.create(projectData);

      return res.redirect(
        '/admin/projects/list?success=Project created successfully',
      );
    } catch (error) {
      console.error('Error creating project:', error);
      return res.redirect(
        '/admin/projects/list?error=' + encodeURIComponent(error.message),
      );
    }
  }

  @Post('projects/:id')
  @UseInterceptors(FilesInterceptor('images', 10))
  async updateProject(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Res() res: Response,
  ) {
    try {
      console.log(`Updating project ${id}:`, updateProjectDto);
      console.log('Uploaded files:', files?.length || 0);

      // Upload new images to Cloudinary if any
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

      // Get existing project to merge with existing images
      const existingProject = await this.projectsService.findOne(Number(id));

      // Prepare update data
      const projectData: any = { ...updateProjectDto };

      // Handle images - merge existing with new ones
      if (uploadedImages.length > 0) {
        projectData.images = [
          ...(existingProject.images || []),
          ...uploadedImages,
        ];
      }

      await this.projectsService.update(Number(id), projectData);

      // Redirect to projects list page with success message
      console.log(
        'Project updated successfully, redirecting to /admin/projects',
      );
      return res.redirect(
        '/admin/projects/list?success=Project updated successfully',
      );
    } catch (error) {
      console.error(`Error updating project ${id}:`, error);
      return res.redirect(
        '/admin/projects/list?error=' + encodeURIComponent(error.message),
      );
    }
  }

  @Post('projects/delete/:id')
  async deleteProject(@Param('id') id: string, @Res() res: Response) {
    try {
      console.log(`Deleting project ${id}`);

      // Get project to delete images from Cloudinary first
      const project = await this.projectsService.findOne(Number(id));

      // Delete images from Cloudinary
      if (project.images && project.images.length > 0) {
        for (const image of project.images) {
          try {
            await this.cloudinaryService.deleteFile(image.publicId);
            console.log(`Deleted image ${image.publicId} from Cloudinary`);
          } catch (cloudinaryError) {
            console.error(
              `Error deleting image from Cloudinary:`,
              cloudinaryError,
            );
          }
        }
      }

      // Delete project from database
      await this.projectsService.remove(Number(id));
      console.log(`Project ${id} deleted from database`);

      // Redirect to projects list with success message
      return res.redirect(
        '/admin/projects/list?success=Project deleted successfully',
      );
    } catch (error) {
      console.error(`Error deleting project ${id}:`, error);
      return res.redirect(
        '/admin/projects/list?error=' + encodeURIComponent(error.message),
      );
    }
  }
}
