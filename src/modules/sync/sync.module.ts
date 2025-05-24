import { Global, Module } from '@nestjs/common';
import { SyncController } from './controller/sync.controller';
import { SyncService } from './service/sync.service';
import { HttpModule } from '@nestjs/axios';
import { SyncProxyService } from './service/sync-proxy.service';

@Global()
@Module({
  imports: [HttpModule],
  controllers: [SyncController],
  providers: [SyncService, SyncProxyService],
  exports: [SyncProxyService, SyncService],
})
export class SyncModule {}
