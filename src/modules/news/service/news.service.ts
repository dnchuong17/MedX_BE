import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HealthNewsEntity } from '../entity/news.entity';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';
import { HealthNewsDto } from '../dto/news.dto';

@Injectable()
export class HealthNewsService {
  constructor(
    @InjectRepository(HealthNewsEntity)
    private readonly repo: Repository<HealthNewsEntity>,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async createWithImage(
    dto: HealthNewsDto,
    file?: Express.Multer.File,
  ): Promise<HealthNewsEntity> {
    let imageUrl: string | undefined;
    if (file) {
      if (!file.mimetype.match(/\/(jpg|jpeg|png)$/))
        throw new InternalServerErrorException('Only JPG/PNG allowed');
      const { url } = await this.cloudinary.uploadImage(
        file.buffer,
        'health-news',
      );
      imageUrl = url;
    }

    const data: Partial<HealthNewsEntity> = {
      title: dto.title,
      content: dto.content,
    };
    if (dto.author) data.author = dto.author;
    if (dto.publishedAt) data.publishedAt = new Date(dto.publishedAt);
    if (imageUrl) data.imageUrl = imageUrl;

    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async findAll(): Promise<HealthNewsEntity[]> {
    return this.repo.find({
      order: { publishedAt: 'DESC', createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<HealthNewsEntity> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`News #${id} not found`);
    return entity;
  }

  async updateWithImage(
    id: number,
    dto: HealthNewsDto,
    file?: Express.Multer.File,
  ): Promise<HealthNewsEntity> {
    const entity = await this.findOne(id);
    let imageUrl = entity.imageUrl;
    if (file) {
      if (!file.mimetype.match(/\/(jpg|jpeg|png)$/))
        throw new InternalServerErrorException('Only JPG/PNG allowed');
      const { url } = await this.cloudinary.uploadImage(
        file.buffer,
        'health-news',
      );
      imageUrl = url;
    }
    Object.assign(entity, dto, { imageUrl });
    return this.repo.save(entity);
  }

  async remove(id: number): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
