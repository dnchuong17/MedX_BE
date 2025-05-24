import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { HealthNewsService } from '../service/news.service';
import { HealthNewsDto } from '../dto/news.dto';


@Controller('health-news')
export class HealthNewsController {
  constructor(private readonly newsService: HealthNewsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() dto: HealthNewsDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.newsService.createWithImage(dto, file);
  }

  @Get()
  async findAll() {
    return this.newsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.newsService.findOne(id);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: HealthNewsDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.newsService.updateWithImage(id, dto, file);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.newsService.remove(id);
  }
}
