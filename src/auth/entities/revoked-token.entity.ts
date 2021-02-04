import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class RevokedToken {
  @PrimaryColumn()
  jti: string;

  @Column()
  exp: Date;
}
