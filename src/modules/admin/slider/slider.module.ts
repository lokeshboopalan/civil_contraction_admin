import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SliderAdminController } from './controllers/slider-admin.controller';
import { SliderService } from './services/slider.service';
import { Slider } from './entities/slider.entity';
import { CloudinaryService } from '../../../shared/services/cloudinary.service';

@Module({
  imports: [TypeOrmModule.forFeature([Slider])],
  controllers: [SliderAdminController],
  providers: [SliderService, CloudinaryService],
  exports: [SliderService],
})
export class SliderModule {}
