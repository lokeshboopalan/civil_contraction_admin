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
import { ServiceService } from '../services/service.service';
import { CreateServiceDto } from '../dto/create-service.dto';
import { UpdateServiceDto } from '../dto/update-service.dto';
import { ServiceStatus } from '../entities/service.entity';
import { CloudinaryService } from '../../../../shared/services/cloudinary.service';
import { WebAuthGuard } from '../../auth/guards/web-auth.guard';
import { BaseController } from '../../../admin/base.controller';

@Controller('admin')
@UseGuards(WebAuthGuard)
export class ServiceAdminController extends BaseController {
  constructor(
    private serviceService: ServiceService,
    private cloudinaryService: CloudinaryService,
  ) {
    super();
    console.log('ProjectAdminController initialized');
  }

  // List all services
  @Get('services')
  @Render('admin/services')
  async getServicesView(
    @Req() req: any,
    @Query('success') success?: string,
    @Query('error') error?: string,
  ) {
    console.log('getServicesView called');
    try {
      const services = await this.serviceService.findAll();

      return {
        title: 'Services Management',
        currentPage: 'services',
        // user: { name: 'Admin User', role: 'admin' },
        user: this.getUserData(req),
        services: services || [],
        success: success || null,
        error: error || null,
      };
    } catch (error) {
      console.error('Error:', error);
      return {
        title: 'Services Management',
        currentPage: 'services',
        // user: { name: 'Admin User', role: 'admin' },
        user: this.getUserData(req),
        services: [],
        success: null,
        error: error.message,
      };
    }
  }

  // Show create form
  @Get('services/create')
  @Render('admin/service-form')
  createServiceForm(@Req() req: any) {
    return {
      title: 'Create Service',
      currentPage: 'services',
      // user: { name: 'Admin User', role: 'admin' },
      user: this.getUserData(req),
      isEdit: false,
      serviceData: {},
    };
  }

  // Show edit form
  @Get('services/edit/:id')
  @Render('admin/service-form')
  async editServiceForm(@Param('id') id: string, @Req() req: any) {
    try {
      const service = await this.serviceService.findOne(Number(id));
      return {
        title: 'Edit Service',
        currentPage: 'services',
        // user: { name: 'Admin User', role: 'admin' },
        user: this.getUserData(req),
        isEdit: true,
        serviceData: service,
      };
    } catch (error) {
      return {
        title: 'Edit Service',
        currentPage: 'services',
        // user: { name: 'Admin User', role: 'admin' },
        user: this.getUserData(req),
        isEdit: true,
        serviceData: {},
        error: 'Service not found',
      };
    }
  }

  // View single service
  @Get('services/view/:id')
  @Render('admin/service-view')
  async viewService(@Param('id') id: string, @Req() req: any) {
    try {
      const service = await this.serviceService.findOne(Number(id));
      return {
        title: 'View Service',
        currentPage: 'services',
        // user: { name: 'Admin User', role: 'admin' },
        user: this.getUserData(req),
        serviceData: service,
      };
    } catch (error) {
      return {
        title: 'View Service',
        currentPage: 'services',
        // user: { name: 'Admin User', role: 'admin' },
        user: this.getUserData(req),
        serviceData: {},
        error: 'Service not found',
      };
    }
  }

  // Create service
  @Post('services')
  @UseInterceptors(FilesInterceptor('images', 10))
  async createService(
    @Body() createDto: CreateServiceDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Res() res: Response,
  ) {
    console.log('reating service');
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

      // Handle features array if it comes as string
      let features: string[] = [];
      if (createDto.features) {
        features = Array.isArray(createDto.features)
          ? createDto.features
          : [createDto.features];
      }

      // Handle boolean conversion for isFeatured
      let isFeatured = true;
      if (createDto.isFeatured !== undefined) {
        if (typeof createDto.isFeatured === 'boolean') {
          isFeatured = createDto.isFeatured;
        } else if (typeof createDto.isFeatured === 'string') {
          isFeatured = createDto.isFeatured === 'true';
        }
      }

      const serviceData = {
        title: createDto.title,
        subtitle: createDto.subtitle,
        description: createDto.description,
        shortDescription: createDto.shortDescription,
        icon: createDto.icon,
        link: createDto.link,
        status: createDto.status || ServiceStatus.ACTIVE,
        isFeatured: isFeatured,
        sortOrder: createDto.sortOrder ? Number(createDto.sortOrder) : 0,
        features: features,
        images: images,
      };

      await this.serviceService.create(serviceData);
      return res.redirect(
        '/admin/services?success=Service created successfully',
      );
    } catch (error) {
      console.error('Error creating service:', error);
      return res.redirect(
        '/admin/services?error=' + encodeURIComponent(error.message),
      );
    }
  }

  // Update service
  @Post('services/update/:id')
  @UseInterceptors(FilesInterceptor('images', 10))
  async updateService(
    @Param('id') id: string,
    @Body() updateDto: UpdateServiceDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Res() res: Response,
  ) {
    try {
      console.log(`Updating service ${id}`);

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

      const existingService = await this.serviceService.findOne(Number(id));

      // Prepare update data
      const serviceData: any = {};

      if (updateDto.title !== undefined) serviceData.title = updateDto.title;
      if (updateDto.subtitle !== undefined)
        serviceData.subtitle = updateDto.subtitle;
      if (updateDto.description !== undefined)
        serviceData.description = updateDto.description;
      if (updateDto.shortDescription !== undefined)
        serviceData.shortDescription = updateDto.shortDescription;
      if (updateDto.icon !== undefined) serviceData.icon = updateDto.icon;
      if (updateDto.link !== undefined) serviceData.link = updateDto.link;
      if (updateDto.status !== undefined) serviceData.status = updateDto.status;
      if (updateDto.sortOrder !== undefined)
        serviceData.sortOrder = Number(updateDto.sortOrder);

      // Handle features array
      if (updateDto.features !== undefined) {
        serviceData.features = Array.isArray(updateDto.features)
          ? updateDto.features
          : [updateDto.features];
      }

      // Handle isFeatured conversion
      if (updateDto.isFeatured !== undefined) {
        if (typeof updateDto.isFeatured === 'boolean') {
          serviceData.isFeatured = updateDto.isFeatured;
        } else if (typeof updateDto.isFeatured === 'string') {
          serviceData.isFeatured = updateDto.isFeatured === 'true';
        }
      }

      if (uploadedImages.length > 0) {
        serviceData.images = [
          ...(existingService.images || []),
          ...uploadedImages,
        ];
      }

      await this.serviceService.update(Number(id), serviceData);
      return res.redirect(
        '/admin/services?success=Service updated successfully',
      );
    } catch (error) {
      console.error(`Error updating service ${id}:`, error);
      return res.redirect(
        '/admin/services?error=' + encodeURIComponent(error.message),
      );
    }
  }

  // Delete service
  @Post('services/delete/:id')
  async deleteService(@Param('id') id: string, @Res() res: Response) {
    try {
      console.log(`Deleting service ${id}`);

      const service = await this.serviceService.findOne(Number(id));

      // Delete images from Cloudinary
      if (service.images && service.images.length > 0) {
        for (const image of service.images) {
          try {
            await this.cloudinaryService.deleteFile(image.publicId);
          } catch (cloudinaryError) {
            console.error(`Error deleting image:`, cloudinaryError);
          }
        }
      }

      await this.serviceService.remove(Number(id));
      return res.redirect(
        '/admin/services?success=Service deleted successfully',
      );
    } catch (error) {
      console.error(`Error deleting service ${id}:`, error);
      return res.redirect(
        '/admin/services?error=' + encodeURIComponent(error.message),
      );
    }
  }

  // Toggle featured status
  @Post('services/toggle-featured/:id')
  async toggleFeatured(@Param('id') id: string, @Res() res: Response) {
    try {
      await this.serviceService.toggleFeatured(Number(id));
      return res.redirect(
        '/admin/services?success=Service featured status updated',
      );
    } catch (error) {
      return res.redirect(
        '/admin/services?error=' + encodeURIComponent(error.message),
      );
    }
  }

  // Update status
  @Post('services/status/:id')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: ServiceStatus,
    @Res() res: Response,
  ) {
    try {
      await this.serviceService.updateStatus(Number(id), status);
      return res.redirect('/admin/services?success=Service status updated');
    } catch (error) {
      return res.redirect(
        '/admin/services?error=' + encodeURIComponent(error.message),
      );
    }
  }

  // Delete single image
  @Delete('services/images/:serviceId/:imagePublicId')
  async deleteImage(
    @Param('serviceId') serviceId: string,
    @Param('imagePublicId') imagePublicId: string,
    @Res() res: Response,
  ) {
    try {
      await this.cloudinaryService.deleteFile(imagePublicId);
      await this.serviceService.removeImage(Number(serviceId), imagePublicId);
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }
}
