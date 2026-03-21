import { Module } from '@nestjs/common';
import { ProjectAdminController } from './controllers/project-admin.controller';
import { ProjectsService } from './services/project.service';
import { CloudinaryModule } from '../../../shared/services/cloudinary.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';

@Module({
  imports: [CloudinaryModule, TypeOrmModule.forFeature([Project])],
  controllers: [ProjectAdminController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {
  constructor() {
    console.log(
      'ProjectsModule LOADED with controller:',
      ProjectAdminController.name,
    );
  }
}
