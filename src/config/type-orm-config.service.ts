import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private readonly config: ConfigService) {}
  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.config.get<string>('DATABASE_HOST', 'localhost'),
      port: this.config.get<number>('DATABASE_PORT', 5432),
      username: this.config.get<string>('DATABASE_USERNAME', 'postgres'),
      password: this.config.get<string>('DATABASE_PASSWORD', ''),
      database: this.config.get<string>('DATABASE', 'postgres'),
      synchronize: this.config.get('DATABASE_SYNCHRONIZE', false),
      autoLoadEntities: true,
    };
  }
}
