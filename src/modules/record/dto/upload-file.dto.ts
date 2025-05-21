import {
  IsNotEmpty,
  IsOptional,
} from 'class-validator';

export class UploadFileDto {
  @IsNotEmpty()
  publicKey: string;

  @IsNotEmpty()
  date: string;

  @IsNotEmpty()
  doctor: string;

  @IsNotEmpty()
  category: string;

  @IsNotEmpty()
  facility: string;

  @IsOptional()
  notes?: string;
}
