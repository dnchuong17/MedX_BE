import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { RecordService } from '../service/record.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadFileDto } from '../dto/upload-file.dto';

@Controller('record')
export class RecordController {
  constructor(private readonly recordService: RecordService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadFileDto: UploadFileDto,
  ) {
    return await this.recordService.uploadFile(file, uploadFileDto);
  }
}
