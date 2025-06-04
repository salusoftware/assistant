import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  create(dto: CreateUserDto) {
    const entity = this.userRepository.create(dto);
    return this.userRepository.save(entity);
  }

  findOne(id: number) {
    return this.userRepository.findOne({
      where: { id },
    });
  }

  findByEmailOrUsername(username: string) {
    if (!username) throw new BadRequestException('Username is required');
    return this.userRepository.findOne({
      where: [{ username }, { email: username }],
    });
  }
}
