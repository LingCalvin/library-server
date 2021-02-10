import { EMAIL_MODULE_OPTIONS } from './email.constants';
import { EmailModuleOptions } from './interfaces/email-config-options.interface';

export function createEmailProvider(options: EmailModuleOptions): any[] {
  return [{ provide: EMAIL_MODULE_OPTIONS, useValue: options || {} }];
}
