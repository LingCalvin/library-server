import { Inject, Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import { EMAIL_MODULE_OPTIONS } from './email.constants';
import { EmailModuleOptions } from './interfaces/email-config-options.interface';

@Injectable()
export class EmailService {
  transporter: Mail;
  constructor(@Inject(EMAIL_MODULE_OPTIONS) options: EmailModuleOptions) {
    this.transporter = nodemailer.createTransport(options);
  }

  send(mailOptions: Mail.Options) {
    return this.transporter.sendMail(mailOptions);
  }
}
