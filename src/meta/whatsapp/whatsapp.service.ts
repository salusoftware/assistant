import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as fs from 'fs';
import { CgptOpenaiService } from '../../cgptopenai/cgpt-openai.service';
import * as FormData from 'form-data';

@Injectable()
export class WhatsappService {
  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
    private cgptOpenAiService: CgptOpenaiService,
  ) {}
  verifyWebhook(mode: string, token: string, challenge: string) {
    if (
      mode === 'subscribe' &&
      token === this.configService.getOrThrow('WHATSAPP_VERIFY_TOKEN')
    ) {
      return challenge;
    } else {
      throw new UnauthorizedException();
    }
  }

  async getMediaUrl(mediaId: string): Promise<string> {
    const response = await firstValueFrom(
      this.httpService.get<unknown>(mediaId),
    );

    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return response?.data.url;
  }

  async downloadMedia(url: string): Promise<Buffer> {
    const response = await firstValueFrom(
      this.httpService.get<unknown>(url, {
        responseType: 'arraybuffer',
      }),
    );

    // @ts-ignore
    return Buffer.from(response.data);
  }

  async handleWebhook(body: {
    entry: Array<{
      changes: Array<{
        value: {
          messages: Array<{
            from: string;
            text: { body: string };
            type: string;
            audio: {
              id: string;
            };
          }>;
        };
      }>;
    }>;
  }) {
    console.log('📨 Webhook recebido:', JSON.stringify(body, null, 2));
    const messages = body.entry?.[0]?.changes?.[0]?.value?.messages;

    if (messages) {
      if (messages[0].type === 'audio') {
        const message = messages[0];

        const mediaId = message.audio.id;
        const from = message.from;

        const audioUrl = await this.getMediaUrl(mediaId);
        const buffer = await this.downloadMedia(audioUrl);
        const transcription =
          await this.cgptOpenAiService.transcribeAudio(buffer);

        const chatGprResponse =
          await this.cgptOpenAiService.completions(transcription);

        if (!chatGprResponse) throw new Error('Erro no fluxo');

        const bufferChatGpt =
          await this.cgptOpenAiService.createAudio(chatGprResponse);

        const uploadedMediaId = await this.uploadMedia(bufferChatGpt);
        await this.sendAudioMessage(from, uploadedMediaId);

        console.log(transcription);
        fs.writeFileSync('audiozap.ogg', buffer);

        console.log({ audioUrl });

        return;
      }

      for (const message of messages) {
        const from = message.from;
        const text = message.text?.body || '[não é texto]';
        console.log(`Mensagem de ${from}: ${text}`);
        // Aqui você pode chamar um serviço, responder, etc.
      }
    }

    return { status: 'received' };
  }

  async uploadMedia(buffer: ArrayBuffer): Promise<string> {
    const form = new FormData();

    form.append('file', buffer, {
      filename: 'resposta.mp3',
      contentType: 'audio/mpeg',
    });
    form.append('type', 'audio/mpeg');
    form.append('messaging_product', 'whatsapp');

    const facebookApiAccount = this.configService.getOrThrow<string>(
      'FACEBOOK_API_ACCOUNT',
    );

    const response = await firstValueFrom(
      this.httpService.post(`${facebookApiAccount}/media`, form, {
        headers: {
          ...form.getHeaders(),
        },
      }),
    );

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-member-access
    return response.data.id; // media_id
  }

  async sendAudioMessage(to: string, mediaId: string) {
    const facebookApiAccount = this.configService.getOrThrow<string>(
      'FACEBOOK_API_ACCOUNT',
    );
    return await firstValueFrom(
      this.httpService.post(`${facebookApiAccount}/messages`, {
        messaging_product: 'whatsapp',
        to,
        type: 'audio',
        audio: {
          id: mediaId,
        },
      }),
    );
  }
}
