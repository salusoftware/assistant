import { Module } from '@nestjs/common';
import { CgptOpenaiService } from './cgpt-openai.service';
import { TesteAssistant } from './assistant/teste.assistant';

@Module({
  exports: [CgptOpenaiService],
  providers: [CgptOpenaiService, TesteAssistant],
})
export class CgptOpenaiModule {}
