import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Post,
  UnauthorizedException,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { TokenDto } from './dto/token.dto';
import { CreatePasswordResetRequestDto } from './dto/create-password-reset-request.dto';
import { AuthService } from '../auth/auth.service';
import { TokenPurpose } from '../auth/enums/token-purpose.enum';
import { EmailService } from '../email/email.service';
import { ConfigService } from '@nestjs/config';
import * as ejs from 'ejs';
import { resolve } from 'path';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { ResetPasswordDto } from './dto/reset-password.dto';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('accounts')
export class AccountsController {
  constructor(
    private usersService: UsersService,
    private authService: AuthService,
    private emailService: EmailService,
    private config: ConfigService,
  ) {}

  @Post('verified-accounts')
  completeRegistration(@Body() { token }: TokenDto) {
    this.usersService.completeRegistration(token);
  }

  @Post('password-resets')
  @Transactional()
  async resetPassword(@Body() { token, password }: ResetPasswordDto) {
    const { sub, use } = await this.authService.verifyToken(token);
    if (use !== TokenPurpose.PasswordReset) {
      throw new UnauthorizedException();
    }
    await this.authService.revokeToken(token);
    await this.usersService.changePassword(sub, password);
  }

  @Post('password-reset-tokens')
  @Transactional()
  async createPasswordResetRequest(
    @Body() { email }: CreatePasswordResetRequestDto,
  ) {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) {
      return;
    }
    const token = await this.authService.issueToken(
      user,
      TokenPurpose.PasswordReset,
    );
    this.emailService.sendMail({
      from: this.config.get('RESET_PASSWORD_EMAIL_FROM'),
      to: email,
      subject: this.config.get(
        'RESET_PASSWORD_EMAIL_SUBJECT',
        'Account Recovery',
      ),
      html: await ejs.renderFile(
        this.config.get(
          'RESET_PASSWORD_EMAIL_TEMPLATE',
          resolve(__dirname, '../templates/reset-password.ejs'),
        ),
        {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          token,
          link: `${this.config.get(
            'RESET_PASSWORD_LINK_BASE',
            'localhost/reset-password',
          )}/${token}`,
        },
      ),
    });
  }
}
