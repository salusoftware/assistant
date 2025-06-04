import { Injectable, Scope } from '@nestjs/common';
import { BaseAssistant } from './base.assistant';
import { AssistantInterface } from './interface/assistant.interface';
import {
  AssistantEvent,
  ToolName,
} from '../../decorators/assistant-decorators';
@Injectable({ scope: Scope.TRANSIENT })
export class TesteAssistant
  extends BaseAssistant
  implements AssistantInterface
{
  assistantId: string = 'ass_...';

  @AssistantEvent('thread.message.delta')
  messageDelta() {}

  @AssistantEvent('thread.run.completed')
  runCompleted() {}

  @AssistantEvent('thread.run.failed')
  runFailed() {}
}
