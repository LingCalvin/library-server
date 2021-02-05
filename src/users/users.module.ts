import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { EmailModule } from '../email/email.module';
import { AuthModule } from '../auth/auth.module';
import { AccountsController } from './accounts.controller';
import { UserCleanupService } from './tasks/user-cleanup.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    EmailModule,
    forwardRef(() => AuthModule),
  ],
  providers: [UsersService, UserCleanupService],
  controllers: [UsersController, AccountsController],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}
