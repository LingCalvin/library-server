import { TokenPurpose } from '../enums/token-purpose.enum';

export interface JwtPayload {
  jti: string;
  sub: string;
  exp: number;
  use: TokenPurpose;
}
