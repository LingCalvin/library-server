import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateVerifiedAccountDto } from './dto/create-verified-account.dto';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('accounts')
export class AccountsController {
  constructor(private usersService: UsersService) {}

  @Post('verified-accounts')
  completeRegistration(@Body() { token }: CreateVerifiedAccountDto) {
    this.usersService.completeRegistration(token);
  }
}
