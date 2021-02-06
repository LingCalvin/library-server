import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { verify } from '../common/utils/password.util';
import { User } from '../users/entities/user.entity';
import { RevokedToken } from './entities/revoked-token.entity';
import { TokenPurpose } from './enums/token-purpose.enum';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';
import { isJWT } from 'class-validator';
import { InvalidTokenException } from './exceptions/invalid-token.exception';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(RevokedToken)
    private revokedTokensRepository: Repository<RevokedToken>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  @Transactional()
  issueToken(user: User, purpose: TokenPurpose) {
    // The exp claim will be set when the token is signed
    const payload: Omit<JwtPayload, 'exp'> = {
      jti: uuidv4(),
      sub: user.id,
      use: purpose,
      email:
        purpose === TokenPurpose.EmailVerification ? user.email : undefined,
    };

    let expiresIn = undefined;
    switch (purpose) {
      case TokenPurpose.Access:
        expiresIn = this.config.get<string>('ACCESS_TOKEN_EXP');
        break;
      case TokenPurpose.EmailVerification:
        expiresIn = this.config.get<string>(
          'EMAIL_VERIFICATION_TOKEN_EXP',
          '7d',
        );
        break;
      case TokenPurpose.PasswordReset:
        expiresIn = this.config.get<string>('PASSWORD_RESET_TOKEN_EXP', '10m');
    }

    return this.jwtService.signAsync(payload, {
      expiresIn,
      secret: user.tokenSecret,
    });
  }

  @Transactional()
  async revokeToken(token: string) {
    const { sub } = this.jwtService.decode(token) as JwtPayload;
    const user = await this.usersRepository.findOne({
      where: { id: sub },
    });

    const { jti, exp } = this.jwtService.verify(token, {
      secret: user.tokenSecret,
    });
    const revokedToken = new RevokedToken();
    revokedToken.jti = jti;
    revokedToken.exp = new Date(exp * 1000);
    return this.revokedTokensRepository.save(revokedToken);
  }

  async isTokenRevoked(jti: string) {
    return !!(await this.revokedTokensRepository.findOne({ where: { jti } }));
  }

  async verifyToken(token: string) {
    if (!isJWT(token)) {
      throw new InvalidTokenException();
    }

    const payload = this.jwtService.decode(token) as JwtPayload;
    if (!payload) {
      throw new InvalidTokenException();
    }

    const user = await this.usersRepository.findOne({
      where: { id: payload.sub },
    });
    if (!user) {
      throw new InvalidTokenException();
    }

    const secret = user.tokenSecret;
    const verifiedToken = this.jwtService.verify(token, {
      secret,
    }) as JwtPayload;

    if (await this.isTokenRevoked(verifiedToken.jti)) {
      throw new InvalidTokenException();
    }

    return verifiedToken;
  }

  async validateUser(username: string, password: string) {
    const user = await this.usersRepository.findOne({
      where: { email: username },
    });
    if (user && (await verify(user.password, password))) {
      return user;
    }
    return null;
  }
}
