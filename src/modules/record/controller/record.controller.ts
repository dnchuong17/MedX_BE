import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { RecordService } from '../service/record.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadFileDto } from '../dto/upload-file.dto';
import { ConfirmRecordDto } from '../dto/confirm.dto';

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

  @Post('confirm-transaction/:id')
  async confirmTransaction(
    @Param('id') recordId: string,
    @Body() dto: ConfirmRecordDto,
  ) {
    return this.recordService.confirmTransaction(recordId, dto.txid);
  }

  @Get(':userId')
  async findAllByUserId(@Param('userId') userId: number) {
    return this.recordService.findAllByUserId(userId);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('file'))
  async updateRecord(
    @UploadedFile() file: Express.Multer.File,
    @Param('id') recordId: string,
    @Body() uploadFileDto: UploadFileDto,
  ) {
    return this.recordService.updateRecord(recordId, file, uploadFileDto);
  }
}
