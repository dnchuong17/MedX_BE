import { IsDateString, IsNotEmpty, IsOptional } from 'class-validator';

export class UploadFileDto {

  @IsNotEmpty()
  publickey: string;

  @IsNotEmpty()
  encrypted_key: string;

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
