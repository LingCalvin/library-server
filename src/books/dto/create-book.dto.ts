import { IsISBN, IsOptional, IsString } from 'class-validator';

export class CreateBookDto {
  @IsOptional()
  @IsISBN(13)
  isbn?: string;

  @IsString()
  title: string;
}
