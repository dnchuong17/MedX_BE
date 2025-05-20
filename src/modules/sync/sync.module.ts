import { Module } from '@nestjs/common';
import { SyncController } from './controller/sync.controller';
import { SyncService } from './service/sync.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [SyncController],
  providers: [SyncService],
  exports: [],
})
export class SyncModule {}
