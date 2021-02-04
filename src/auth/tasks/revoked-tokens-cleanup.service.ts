import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { RevokedToken } from '../entities/revoked-token.entity';

@Injectable()
export class RevokedTokensCleanupService {
  constructor(
    @InjectRepository(RevokedToken)
    private revokedTokensRepository: Repository<RevokedToken>,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  cleanupExpiredRevokedTokens() {
    this.revokedTokensRepository.delete({ exp: LessThan(new Date()) });
  }
}
