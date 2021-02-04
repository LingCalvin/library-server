import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { generateHash } from '../common/utils/password.util';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  @Transactional()
  async create({
    email,
    password,
    firstName,
    middleName,
    lastName,
    phoneNumber,
  }: CreateUserDto) {
    const user = new User();
    user.email = email;
    user.password = await generateHash(password);
    user.firstName = firstName;
    user.middleName = middleName;
    user.lastName = lastName;
    user.phoneNumber = phoneNumber;
    return this.usersRepository.save(user);
  }

  findOne(id: string) {
    return this.usersRepository.findOne({ where: { id } });
  }

  findOneByEmail(email: string) {
    return this.usersRepository.findOne({ where: { email } });
  }

  findAll() {
    return this.usersRepository.find();
  }

  @Transactional()
  async updateUserInfo(id: string, userInfo: UpdateUserDto) {
    this.usersRepository.update(id, {
      firstName: userInfo.firstName,
      middleName: userInfo.middleName,
      lastName: userInfo.lastName,
      phoneNumber: userInfo.phoneNumber,
      email: userInfo.email,
      password: userInfo.password
        ? await generateHash(userInfo.password)
        : undefined,
      isActive: userInfo.isActive,
    });
  }

  @Transactional()
  changeEmail(id: string, email: string) {
    this.usersRepository.update({ id }, { email });
  }

  @Transactional()
  remove(id: string) {
    this.usersRepository.delete(id);
  }
}
