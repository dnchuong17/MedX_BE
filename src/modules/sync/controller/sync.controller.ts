import { Controller, Get, Query } from '@nestjs/common';
import { SyncService } from '../service/sync.service';

@Controller('sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Get()
  async getMultiplePatientInfo() {
    return this.syncService.fetchAllPatients();
  }
}
