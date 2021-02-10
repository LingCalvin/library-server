import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  EmailModuleOptions,
  EmailOptionsFactory,
} from '../email/interfaces/email-config-options.interface';

@Injectable()
export class EmailConfigService implements EmailOptionsFactory {
  constructor(private readonly config: ConfigService) {}

  createEmailOptions(): EmailModuleOptions {
    return {
      host: this.config.get('EMAIL_HOST'),
      port: this.config.get<number>('EMAIL_PORT'),
      secure: this.config.get<boolean>('EMAIL_SECURE'),
      auth: {
        user: this.config.get('EMAIL_USER'),
        pass: this.config.get('EMAIL_PASSWORD'),
      },
    };
  }
}
