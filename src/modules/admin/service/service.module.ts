import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceAdminController } from './controllers/service-admin.controller';
import { ServiceService } from './services/service.service';
import { Service } from './entities/service.entity';
import { CloudinaryService } from '../../../shared/services/cloudinary.service';

@Module({
  imports: [TypeOrmModule.forFeature([Service])],
  controllers: [ServiceAdminController],
  providers: [ServiceService, CloudinaryService],
  exports: [ServiceService],
})
export class ServiceModule {}
