import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  private validateLogin(dto: { username: string; password: string }) {
    if (!dto || !dto.username || !dto.password) {
      throw new BadRequestException('Username and password are required');
    }
  }

  async signIn(dto: { username: string; password: string }): Promise<{
    accessToken: string;
    user: { sub: number; username: string };
  }> {
    this.validateLogin(dto);

    const user = await this.userService.findByEmailOrUsername(dto.username);
    if (!user) {
      throw new UnauthorizedException();
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException();
    }

    const payload: {
      sub: number;
      username: string;
    } = {
      sub: user.id,
      username: user.username,
    };

    return {
      user: {
        sub: user.id,
        username: user.username,
      },
      accessToken: await this.jwtService.signAsync(payload),
    };
  }
}
