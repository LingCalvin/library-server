import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

@Injectable()
export class EmailService {
  transporter: Mail;
  constructor(config: ConfigService) {
    const smtpOptions: SMTPTransport.Options = {
      host: config.get('EMAIL_HOST'),
      port: config.get<number>('EMAIL_PORT'),
      secure: config.get<boolean>('EMAIL_SECURE'),
      auth: {
        user: config.get('EMAIL_USER'),
        pass: config.get('EMAIL_PASSWORD'),
      },
    };
    this.transporter = nodemailer.createTransport(smtpOptions);
  }

  sendMail(mailOptions: Mail.Options) {
    return this.transporter.sendMail(mailOptions);
  }
}
