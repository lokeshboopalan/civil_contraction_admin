import { Module } from '@nestjs/common';
import { AdminViewController } from './controllers/admin-view.controller';
import { AdminUserController } from './controllers/admin-user.controller';
import { AdminUsersController } from './controllers/admin.controller';
import { AdminAuthGuard } from './guards/admin-auth.guard';
import { UserModule } from '../user/user.module';
import { AuthModule } from './auth/auth.module';
import { ProjectsModule } from './project/project.module';
import { SliderModule } from './slider/slider.module';
import { ArticleModule } from './article/article.module';
import { FeatureProjectModule } from './feature-project/feature-project.module';
import { ServiceModule } from './service/service.module';
import { AboutModule } from './about/about.module';

@Module({
  imports: [
    UserModule,
    AuthModule,
    ProjectsModule,
    SliderModule,
    ArticleModule,
    FeatureProjectModule,
    ServiceModule,
    AboutModule,
  ],
  controllers: [AdminViewController, AdminUserController, AdminUsersController],
  providers: [AdminAuthGuard],
  exports: [AdminAuthGuard],
})
export class AdminModule {
  constructor() {
    console.log('AdminModule LOADED with ProjectsModule');
  }
}
