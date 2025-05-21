import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class SyncService {
  constructor(private readonly httpService: HttpService) {}

  async fetchAllPatients(studentIds: string[]) {
    if (!studentIds || studentIds.length === 0) return [];

    const csv = studentIds.join(',');
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
      return studentIds.map((id) => ({
        student_id: id,
        error: 'Failed to fetch data',
      }));
    }
  }
}
