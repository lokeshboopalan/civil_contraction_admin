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
import { SliderService } from '../services/slider.service';
import { CreateSliderDto } from '../dto/create-slider.dto';
import { UpdateSliderDto } from '../dto/update-slider.dto';
import { CloudinaryService } from '../../../../shared/services/cloudinary.service';
import { WebAuthGuard } from '../../auth/guards/web-auth.guard';
import { BaseController } from '../../../admin/base.controller';

@Controller('admin')
@UseGuards(WebAuthGuard)
export class SliderAdminController extends BaseController {
  constructor(
    private sliderService: SliderService,
    private cloudinaryService: CloudinaryService,
  ) {
    super();
    console.log('ProjectAdminController initialized');
  }

  // List all sliders
  @Get('sliders')
  @Render('admin/sliders')
  async getSlidersView(
    @Req() req: any,
    @Query('success') success?: string,
    @Query('error') error?: string,
  ) {
    console.log('getSlidersView called');
    try {
      const sliders = await this.sliderService.findAll();

      return {
        title: 'Sliders Management',
        currentPage: 'sliders',
        // user: { name: 'Admin User', role: 'admin' },
        user: this.getUserData(req),
        sliders: sliders || [],
        success: success || null,
        error: error || null,
      };
    } catch (error) {
      console.error('Error:', error);
      return {
        title: 'Sliders Management',
        currentPage: 'sliders',
        // user: { name: 'Admin User', role: 'admin' },
        user: this.getUserData(req),
        sliders: [],
        success: null,
        error: error.message,
      };
    }
  }

  // Show create form
  @Get('sliders/create')
  @Render('admin/slider-form')
  createSliderForm(@Req() req: any) {
    return {
      title: 'Create Slider',
      currentPage: 'sliders',
      // user: { name: 'Admin User', role: 'admin' },
      user: this.getUserData(req),
      isEdit: false,
      sliderData: {},
    };
  }

  // Show edit form
  @Get('sliders/edit/:id')
  @Render('admin/slider-form')
  async editSliderForm(@Param('id') id: string, @Req() req: any) {
    try {
      const slider = await this.sliderService.findOne(Number(id));
      return {
        title: 'Edit Slider',
        currentPage: 'sliders',
        // user: { name: 'Admin User', role: 'admin' },
        user: this.getUserData(req),
        isEdit: true,
        sliderData: slider,
      };
    } catch (error) {
      return {
        title: 'Edit Slider',
        currentPage: 'sliders',
        // user: { name: 'Admin User', role: 'admin' },
        user: this.getUserData(req),
        isEdit: true,
        sliderData: {},
        error: 'Slider not found',
      };
    }
  }

  // View single slider
  @Get('sliders/view/:id')
  @Render('admin/slider-view')
  async viewSlider(@Param('id') id: string, @Req() req: any) {
    try {
      const slider = await this.sliderService.findOne(Number(id));
      return {
        title: 'View Slider',
        currentPage: 'sliders',
        // user: { name: 'Admin User', role: 'admin' },
        user: this.getUserData(req),
        sliderData: slider,
      };
    } catch (error) {
      return {
        title: 'View Slider',
        currentPage: 'sliders',
        // user: { name: 'Admin User', role: 'admin' },
        user: this.getUserData(req),
        sliderData: {},
        error: 'Slider not found',
      };
    }
  }

  // Create slider
  @Post('sliders')
  @UseInterceptors(FilesInterceptor('images', 10))
  async createSlider(
    @Body() createSliderDto: CreateSliderDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Res() res: Response,
  ) {
    console.log('Creating slider');
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
      let isActive = true; // default value

      if (createSliderDto.isActive !== undefined) {
        // If it's already a boolean, use it directly
        if (typeof createSliderDto.isActive === 'boolean') {
          isActive = createSliderDto.isActive;
        }
        // If it's a string (from form submission), convert it
        else if (typeof createSliderDto.isActive === 'string') {
          isActive = createSliderDto.isActive === 'true';
        }
      }

      // Create the data object matching the service interface
      const sliderData = {
        title: createSliderDto.title,
        subTitle: createSliderDto.subTitle,
        description: createSliderDto.description,
        order: createSliderDto.order,
        isActive: isActive,
        images: images,
      };

      await this.sliderService.create(sliderData);
      return res.redirect('/admin/sliders?success=Slider created successfully');
    } catch (error) {
      console.error('Error creating slider:', error);
      return res.redirect(
        '/admin/sliders?error=' + encodeURIComponent(error.message),
      );
    }
  }
  // Update slider
  @Post('sliders/update/:id')
  @UseInterceptors(FilesInterceptor('images', 10))
  async updateSlider(
    @Param('id') id: string,
    @Body() updateSliderDto: UpdateSliderDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Res() res: Response,
  ) {
    try {
      console.log(`Updating slider ${id}`);

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

      const existingSlider = await this.sliderService.findOne(Number(id));
      const sliderData: any = { ...updateSliderDto };

      if (uploadedImages.length > 0) {
        sliderData.images = [
          ...(existingSlider.images || []),
          ...uploadedImages,
        ];
      }

      await this.sliderService.update(Number(id), sliderData);
      return res.redirect('/admin/sliders?success=Slider updated successfully');
    } catch (error) {
      console.error(`Error updating slider ${id}:`, error);
      return res.redirect(
        '/admin/sliders?error=' + encodeURIComponent(error.message),
      );
    }
  }

  // Delete slider
  @Post('sliders/delete/:id')
  async deleteSlider(@Param('id') id: string, @Res() res: Response) {
    try {
      console.log(`Deleting slider ${id}`);

      const slider = await this.sliderService.findOne(Number(id));

      // Delete images from Cloudinary
      if (slider.images && slider.images.length > 0) {
        for (const image of slider.images) {
          try {
            await this.cloudinaryService.deleteFile(image.publicId);
          } catch (cloudinaryError) {
            console.error(`Error deleting image:`, cloudinaryError);
          }
        }
      }

      await this.sliderService.remove(Number(id));
      return res.redirect('/admin/sliders?success=Slider deleted successfully');
    } catch (error) {
      console.error(`Error deleting slider ${id}:`, error);
      return res.redirect(
        '/admin/sliders?error=' + encodeURIComponent(error.message),
      );
    }
  }

  // Delete single image
  @Delete('sliders/images/:sliderId/:imagePublicId')
  async deleteImage(
    @Param('sliderId') sliderId: string,
    @Param('imagePublicId') imagePublicId: string,
    @Res() res: Response,
  ) {
    try {
      await this.cloudinaryService.deleteFile(imagePublicId);
      await this.sliderService.removeImage(Number(sliderId), imagePublicId);
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }
}
