import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude({ toPlainOnly: true })
  password: string;

  @Column()
  firstName: string;

  @Column({ nullable: true })
  middleName: string | null;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  phoneNumber: string | null;

  @Column()
  @Exclude({ toPlainOnly: true })
  tokenSecret: string;

  @Column({ default: false })
  isActive: boolean;

  @Column({ default: false })
  isEmailVerified: boolean;

  @CreateDateColumn()
  registrationDate: Date;
}
