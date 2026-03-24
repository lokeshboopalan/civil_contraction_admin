import { Module } from '@nestjs/common';
import { FrontendController } from './frontend.controller';
import { AboutModule } from '../../admin/about/about.module';
import { ServiceModule } from '../../admin/service/service.module';
import { ProjectsModule } from '../../admin/project/project.module';
import { FeatureProjectModule } from '../../admin/feature-project/feature-project.module';
import { SliderModule } from '../../admin/slider/slider.module';
import { ArticleModule } from '../../admin/article/article.module';

@Module({
  imports: [
    AboutModule,
    ServiceModule,
    ProjectsModule,
    FeatureProjectModule,
    SliderModule,
    ArticleModule,
  ],
  controllers: [FrontendController],
  providers: [],
  exports: [],
})
export class FrontendModule {}
