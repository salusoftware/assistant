import { IsEmail, Length } from 'class-validator';
import { isUnique } from '../../validators/is-unique-constraint/is-unique-constraint.decorator';

export class CreateUserDto {
  @Length(1, 255)
  name: string;

  @Length(1, 30)
  @isUnique({ tableName: 'user', column: 'username' })
  username: string;

  @Length(1, 16)
  password: string;

  @Length(1, 255)
  @IsEmail()
  @isUnique({ tableName: 'user', column: 'email' })
  email: string;
}
