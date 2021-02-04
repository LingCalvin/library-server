import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModuleOptions, JwtOptionsFactory } from '@nestjs/jwt';

@Injectable()
export class JwtConfigService implements JwtOptionsFactory {
  constructor(private readonly config: ConfigService) {}
  createJwtOptions(): JwtModuleOptions {
    return {
      secret: this.config.get('JWT_SECRET'),
      signOptions: {
        expiresIn: this.config.get('JWT_EXPIRES_IN', '1h'),
        algorithm: this.config.get('JWT_SIGNING_ALGORITHM', 'HS256'),
      },
    };
  }
}
