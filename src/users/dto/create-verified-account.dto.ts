import { IsJWT } from 'class-validator';

export class CreateVerifiedAccountDto {
  @IsJWT()
  token: string;
}
