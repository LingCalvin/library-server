import { IsNotEmpty, IsString } from 'class-validator';
import { TokenDto } from './token.dto';

export class ResetPasswordDto extends TokenDto {
  @IsString()
  @IsNotEmpty()
  password: string;
}
