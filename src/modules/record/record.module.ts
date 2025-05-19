import { Module } from '@nestjs/common';
import { RecordService } from './service/record.service';
import { RecordController } from './controller/record.controller';

@Module({
  controllers: [RecordController],
  providers: [RecordService],
})
export class RecordModule {}
