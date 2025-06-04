import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { Public } from './constants';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: { username: string; password: string }) {
    return this.authService.signIn(dto);
  }

  @UseGuards(AuthGuard)
  @Get('me')
  getProfile(@Req() request: Request) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return request['user']; // ou um objeto filtrado, se preferir
  }
}
