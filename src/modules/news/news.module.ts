import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthNewsEntity } from './entity/news.entity';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { HealthNewsService } from './service/news.service';
import { HealthNewsController } from './controller/news.controller';

@Module({
  imports: [TypeOrmModule.forFeature([HealthNewsEntity]), CloudinaryModule],
  providers: [HealthNewsService],
  controllers: [HealthNewsController],
  exports: [HealthNewsService],
})
export class HealthNewsModule {}
