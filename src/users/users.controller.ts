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
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { CreateUserDto } from './dto/create-user.dto';
import { IdParamDto } from './dto/id-param.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
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
