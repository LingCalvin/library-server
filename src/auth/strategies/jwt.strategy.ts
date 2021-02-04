import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';
import { AuthService } from '../auth.service';
import { TokenPurpose } from '../enums/token-purpose.enum';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private usersService: UsersService,
    private authService: AuthService,
    private jwtService: JwtService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (req: Request) => req.cookies.access_token,
      ]),
      ignoreExpiration: false,
      secretOrKeyProvider: async (request, token, done) => {
        try {
          const decoded = this.jwtService.decode(token) as JwtPayload;
          const user = await this.usersService.findOne(decoded.sub);
          done(null, user.tokenSecret);
        } catch (e) {
          done(e);
        }
      },
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.usersService.findOne(payload.sub);
    const isRevoked = await this.authService.isTokenRevoked(payload.jti);
    if (payload.use !== TokenPurpose.Access || isRevoked) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
