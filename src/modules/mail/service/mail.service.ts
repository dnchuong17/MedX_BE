import { Injectable } from '@nestjs/common';
import { transporter } from '../../config/mail.config';

@Injectable()
export class MailService {
  async sendOtp(to: string, otp: string) {
    const mailOptions = {
      from: '"MedX" <noreply@medx.com>',
      to,
      subject: 'Your OTP Code',
      text: `Your OTP code is: ${otp}. It expires in 5 minutes.`,
    };
    await transporter.sendMail(mailOptions);
  }
}
