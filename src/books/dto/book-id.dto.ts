import { IsUUID } from 'class-validator';

export class BookIdDto {
  @IsUUID()
  id: string;
}
