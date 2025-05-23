import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { SyncProxyService } from './sync-proxy.service';

@Injectable()
export class SyncService {
  constructor(
    private readonly httpService: HttpService,
    private readonly syncProxyService: SyncProxyService,
  ) {}

  async fetchAllPatients() {
    const studentInfo = await this.syncProxyService.getStudentInfo();
    if (!studentInfo?.length) {
      return;
    }
    const csv = studentInfo.map((s) => s.studentId).join(',');
    const url = `http://localhost:2024/patient/information?studentIds=${encodeURIComponent(csv)}`;

    try {
      const response$ = this.httpService.get(url);
      const response = await firstValueFrom(response$);
      const rawData: any = response.data;

      const filteredData = rawData.map((item: any) => ({
        student_id: item.student_id,
        allergy: item.allergy,
        blood_type: item.blood_type,
        ethnicity: item.ethnicity,
        treatment: item.treatment,
        diagnosis: item.diagnosis,
        date: item.date,
        suggest: item.suggest,
        appointmentId: item.appointmentId,
        temperature: item.temperature,
        blood_pressure: item.blood_pressure,
        heart_rate: item.heart_rate,
        respiratory_rate: item.respiratory_rate,
        surgical_history: item.surgical_history,
      }));

      return filteredData;
    } catch (error) {
      console.error('Failed to fetch patient data:', error);
      return studentInfo.map((s) => ({
        student_id: s.studentId,
        error: 'Failed to fetch data',
      }));
    }
  }
}
