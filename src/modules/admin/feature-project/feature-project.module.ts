import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeatureProjectAdminController } from './controllers/feature-project-admin.controller';
import { FeatureProjectService } from './services/feature-project.service';
import { FeatureProject } from './entities/feature-project.entity';
import { CloudinaryService } from '../../../shared/services/cloudinary.service';

@Module({
  imports: [TypeOrmModule.forFeature([FeatureProject])],
  controllers: [FeatureProjectAdminController],
  providers: [FeatureProjectService, CloudinaryService],
  exports: [FeatureProjectService],
})
export class FeatureProjectModule {}
