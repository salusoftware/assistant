import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class CgptOpenaiService {
  private openAi: OpenAI;

  constructor() {
    this.openAi = new OpenAI();
  }

  async createAudio(audioString: string, voice?: string) {
    const response = await this.openAi.audio.speech.create({
      model: 'tts-1',
      voice: voice ?? 'nova', // opções: alloy, echo, fable, onyx, nova, shimmer
      input: audioString,
    });

    return Buffer.from(await response.arrayBuffer());
  }

  async transcribeAudio(buffer: any): Promise<string> {
    const tempPath = path.resolve(__dirname, 'temp_audio.ogg');
    fs.writeFileSync(tempPath, buffer); // salvar o buffer como arquivo

    const stream = fs.createReadStream(tempPath);

    const transcription = await this.openAi.audio.transcriptions.create({
      file: stream,
      model: 'gpt-4o-mini-transcribe',
      language: 'pt', // opcional
    });

    fs.unlinkSync(tempPath); // limpa o arquivo após uso

    return transcription.text;
  }

  async completions(prompt: string) {
    const completion = await this.openAi.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'Você é um assistente util.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    return completion.choices[0].message.content;
  }
}
