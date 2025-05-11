import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { ConfigService } from '@nestjs/config';

@Controller('whatsapp')
export class WhatsappController {
  constructor(
    private readonly whatsappService: WhatsappService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
  ) {
    console.log(this.configService.get<string>('URL_FACEBOOK_API'));
    return this.whatsappService.verifyWebhook(mode, token, challenge);
  }

  @Post()
  handleWebhook(
    @Body()
    body: {
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
    },
  ) {
    this.whatsappService.handleWebhook(body);
  }
}
