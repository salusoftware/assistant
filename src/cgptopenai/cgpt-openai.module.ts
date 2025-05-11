import { Module } from '@nestjs/common';
import { CgptOpenaiService } from './cgpt-openai.service';

@Module({
  exports: [CgptOpenaiService],
  providers: [CgptOpenaiService],
})
export class CgptOpenaiModule {}
