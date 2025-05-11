import { Module } from '@nestjs/common';
import { WhatsappController } from './whatsapp.controller';
import { WhatsappService } from './whatsapp.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CgptOpenaiModule } from '../../cgptopenai/cgpt-openai.module';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule], // Importa ConfigService para acessar variáveis de ambiente
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const facebookApiVersion = configService.getOrThrow<string>(
          'FACEBOOK_API_VERSION',
        );

        const facebookApiUrl = configService
          .getOrThrow<string>('URL_FACEBOOK_API')
          .replace('{FACEBOOK_API_VERSION}', facebookApiVersion);

        return {
          baseURL: facebookApiUrl,
          // timeout: 5000,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${configService.getOrThrow<string>('WHATSAPP_ACCESS_TOKEN')}`,
          },
        };
      },
    }),
    CgptOpenaiModule,
  ],
  controllers: [WhatsappController],
  providers: [WhatsappService],
  exports: [WhatsappService],
})
export class WhatsappModule {}
