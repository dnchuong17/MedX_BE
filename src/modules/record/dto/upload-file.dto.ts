import { IsDateString, IsNotEmpty, IsOptional } from 'class-validator';

export class UploadFileDto {
  @IsNotEmpty()
  publicKey: string;

  @IsNotEmpty()
  encryption_key: string;

  @IsDateString()
  date: string;

  @IsNotEmpty()
  doctor: string;

  @IsNotEmpty()
  category: string;

  @IsNotEmpty()
  facility: string;

  @IsOptional()
  notes?: string;

  @IsNotEmpty()
  userId: number;
}
