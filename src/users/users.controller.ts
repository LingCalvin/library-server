import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { EmailService } from '../email/email.service';
import { CreateUserDto } from './dto/create-user.dto';
import { IdParamDto } from './dto/id-param.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
import * as ejs from 'ejs';
import { resolve } from 'path';
import { AuthService } from '../auth/auth.service';
import { TokenPurpose } from '../auth/enums/token-purpose.enum';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private emailsService: EmailService,
    private authService: AuthService,
    private config: ConfigService,
  ) {}

  @Post()
  @Transactional()
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    const token = await this.authService.issueToken(
      user,
      TokenPurpose.EmailVerification,
    );
    this.emailsService.send({
      from: this.config.get('REGISTRATION_EMAIL_FROM'),
      to: createUserDto.email,
      subject: this.config.get(
        'REGISTRATION_EMAIL_SUBJECT',
        'Complete Registration',
      ),
      html: await ejs.renderFile(
        this.config.get(
          'CONFIRM_EMAIL_TEMPLATE',
          resolve(__dirname, '../templates/complete-registration.ejs'),
        ),
        {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          token,
          link: `${this.config.get(
            'COMPLETE_REGISTRATION_LINK_BASE',
            'localhost/confirm-email',
          )}/${token}`,
        },
      ),
    });
    return user;
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Patch(':id')
  @Transactional()
  update(@Param() { id }: IdParamDto, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateUserInfo(id, updateUserDto);
  }

  @Get(':id')
  findOne(@Param() { id }: IdParamDto) {
    return this.usersService.findOne(id);
  }
}
