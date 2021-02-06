import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { TokenPurpose } from './enums/token-purpose.enum';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('access-tokens')
  async issueAccessToken(
    @Req() req,
    @Res({ passthrough: true }) res: Response,
  ) {
    const accessToken = await this.authService.issueToken(
      req.user,
      TokenPurpose.Access,
    );
    const { exp } = this.jwtService.decode(accessToken) as JwtPayload;
    res.cookie('access_token', accessToken, {
      expires: new Date(exp * 1000),
      httpOnly: true,
      secure: this.config.get('COOKIE_SECURE') === 'true',
      sameSite: 'strict',
    });

    // Revoke an existing access token before issuing another one
    if (req.cookies.access_token) {
      try {
        await this.authService.revokeToken(req.cookies.access_token);
      } catch {
        // Attempting to revoke an invalid token is alright
      }
    }

    return { access_token: accessToken };
  }

  @UseGuards(JwtAuthGuard)
  @Get('test')
  test() {
    return;
  }
}
