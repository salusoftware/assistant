import { AssistantInterface } from './interface/assistant.interface';
import { AssistantFlow } from './assistant.flow';

export abstract class BaseAssistant implements AssistantInterface {
  abstract assistantId: string;

  run({ threadId, message }: { threadId: string; message: string }): void {
    const assistantFlow = new AssistantFlow(this, {
      threadId,
      message,
      assistantId: this.assistantId,
    });

    void assistantFlow.run();
  }
}
