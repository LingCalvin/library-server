import { IsEmail } from 'class-validator';

export class CreatePasswordResetRequestDto {
  @IsEmail()
  email: string;
}
