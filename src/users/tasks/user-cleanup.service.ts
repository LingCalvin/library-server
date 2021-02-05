import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class UserCleanupService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  removeUnverifiedUsers() {
    this.usersRepository.delete({
      isEmailVerified: false,
      isActive: false,
      registrationDate: LessThan(
        new Date(new Date().valueOf() - 24 * 60 * 60 * 1000 * 7),
      ),
    });
  }
}
