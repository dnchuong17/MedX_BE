import { Expose } from 'class-transformer';

export class StudentInfoDto {
  @Expose()
  studentId : number;
}