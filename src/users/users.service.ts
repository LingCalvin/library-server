import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { AuthService } from '../auth/auth.service';
import { InvalidTokenException } from '../auth/exceptions/invalid-token.exception';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { generateHash } from '../common/utils/password.util';
import { generateTokenSecret } from '../common/utils/secret.util';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService,
  ) {}

  @Transactional()
  async create(createUserDto: CreateUserDto) {
    const user = new User();
    user.email = createUserDto.email;
    user.password = await generateHash(createUserDto.password);
    user.firstName = createUserDto.firstName;
    user.middleName = createUserDto.middleName;
    user.lastName = createUserDto.lastName;
    user.phoneNumber = createUserDto.phoneNumber;
    user.tokenSecret = generateTokenSecret();
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
    if (userInfo.password) {
      await this.changePassword(id, userInfo.password);
    }
    this.usersRepository.update(id, {
      firstName: userInfo.firstName,
      middleName: userInfo.middleName,
      lastName: userInfo.lastName,
      phoneNumber: userInfo.phoneNumber,
      email: userInfo.email,
      isActive: userInfo.isActive,
    });
  }

  @Transactional()
  async changePassword(id: string, password: string) {
    this.usersRepository.update(id, {
      password: await generateHash(password),
      tokenSecret: generateTokenSecret(),
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

  @Transactional()
  async completeRegistration(token: string) {
    try {
      const { sub } = this.jwtService.decode(token) as JwtPayload;
      const user = await this.findOne(sub);
      const { jti, email } = this.jwtService.verify(token, {
        secret: user.tokenSecret,
      }) as JwtPayload;
      if (
        (await this.authService.isTokenRevoked(jti)) ||
        email !== user.email
      ) {
        throw new InvalidTokenException();
      }
      this.usersRepository.update(sub, {
        isEmailVerified: true,
        isActive: true,
      });
    } catch (e) {
      throw e;
    }
  }
}
