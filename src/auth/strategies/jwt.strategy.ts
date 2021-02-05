import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { isJWT } from 'class-validator';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { AuthService } from '../auth.service';
import { TokenPurpose } from '../enums/token-purpose.enum';
import { InvalidTokenException } from '../exceptions/invalid-token.exception';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private authService: AuthService,
    private jwtService: JwtService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (req: Request) => req.cookies.access_token,
      ]),
      ignoreExpiration: false,
      secretOrKeyProvider: async (_request, token, done) => {
        if (!isJWT(token)) {
          done(new InvalidTokenException());
          return;
        }
        try {
          const { sub } = this.jwtService.decode(token) as JwtPayload;
          const user = await this.usersRepository.findOne({
            where: { id: sub },
          });
          done(null, user?.tokenSecret);
        } catch (e) {
          done(e);
        }
      },
    });
  }

  async validate({ sub, jti, use }: JwtPayload) {
    const user = await this.usersRepository.findOne({ where: { id: sub } });
    const isRevoked = await this.authService.isTokenRevoked(jti);
    if (use !== TokenPurpose.Access || isRevoked) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
