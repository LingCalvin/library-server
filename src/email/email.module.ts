import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import { EMAIL_MODULE_OPTIONS } from './email.constants';
import { createEmailProvider } from './email.providers';
import { EmailService } from './email.service';
import {
  EmailModuleAsyncOptions,
  EmailModuleOptions,
  EmailOptionsFactory,
} from './interfaces/email-config-options.interface';

@Global()
@Module({
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {
  static forRoot(options: EmailModuleOptions): DynamicModule {
    return {
      module: EmailModule,
      providers: createEmailProvider(options),
      exports: [EmailService],
    };
  }

  static forRootAsync(options: EmailModuleAsyncOptions): DynamicModule {
    return {
      module: EmailModule,
      imports: options.imports || [],
      providers: this.createAsyncProviders(options),
      exports: [EmailService],
    };
  }

  private static createAsyncProviders(
    options: EmailModuleAsyncOptions,
  ): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }
    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: options.useClass,
        useClass: options.useClass,
      },
    ];
  }

  private static createAsyncOptionsProvider(
    options: EmailModuleAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: EMAIL_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }
    return {
      provide: EMAIL_MODULE_OPTIONS,
      useFactory: async (optionsFactory: EmailOptionsFactory) =>
        await optionsFactory.createEmailOptions(),
      inject: [options.useExisting || options.useClass],
    };
  }
}
