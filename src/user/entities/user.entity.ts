import { BeforeInsert, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import * as bcrypt from 'bcryptjs';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar')
  email: string;

  @Column('varchar')
  password: string;

  @BeforeInsert()
  async hashPassword() {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }
}