import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { CgptOpenaiService } from './cgptopenai/cgpt-openai.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly cgptOpenaiService: CgptOpenaiService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/audio')
  async getAudio() {
    await this.cgptOpenaiService.createAudio(
      'Júlio, júlio .... Júlio, Ei, Júlio, vem aqui.. Vem Júlio',
      'fable',
    );
    return { success: true };
  }
}
