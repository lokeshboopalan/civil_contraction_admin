import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AboutAdminController } from './controllers/about-admin.controller';
import { AboutService } from './services/about.service';
import { About } from './entities/about.entity';
import { CloudinaryService } from '../../../shared/services/cloudinary.service';

@Module({
  imports: [TypeOrmModule.forFeature([About])],
  controllers: [AboutAdminController],
  providers: [AboutService, CloudinaryService],
  exports: [AboutService],
})
export class AboutModule {}
