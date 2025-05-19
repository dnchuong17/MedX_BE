import { Controller } from '@nestjs/common';
import { RecordService } from '../service/record.service';

@Controller('record')
export class RecordController {
  constructor(private readonly recordService: RecordService) {}
}
