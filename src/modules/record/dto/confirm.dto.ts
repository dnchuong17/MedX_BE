import { IsNotEmpty, IsString } from 'class-validator';

export class ConfirmRecordDto {
  @IsNotEmpty()
  @IsString()
  txid: string;
}
