import {
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import { CgptOpenaiService } from './cgptopenai/cgpt-openai.service';
import { FileInterceptor } from '@nestjs/platform-express';

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
  //
  // @Get('/assistant')
  // async assistant() {
  //   await this.cgptOpenaiService.assistant();
  //   return { success: true };
  // }

  @Post('/assistant/audio')
  @UseInterceptors(FileInterceptor('file'))
  async assistant(@UploadedFile() file: Express.Multer.File) {
    const transcription = await this.cgptOpenaiService.transcribeAudio(
      file.buffer,
      file.originalname,
    );
    console.log(transcription);
    return { transcription };
  }
}
