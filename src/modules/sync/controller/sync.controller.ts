import { Controller, Get, Query } from '@nestjs/common';
import { SyncService } from '../service/sync.service';

@Controller('sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Get()
  async getMultiplePatientInfo(@Query('ids') ids: string) {
    const studentIds = ids.split(',').map((id) => id.trim());

    return this.syncService.fetchAllPatients(studentIds);
  }
}
