import OpenAI from 'openai';
import { EventEmitter } from 'events';
import { BaseAssistant } from './base.assistant';
import { Logger, OnModuleDestroy } from '@nestjs/common';
import { AssistantProcessDecoratorService } from './assistant-process-decorator-service';
import { ASSISTANT_EVENT_METADATA } from '../../decorators/assistant-decorators';
import { AssistantStreamEvent } from 'openai/resources/beta';

export class AssistantFlow extends EventEmitter implements OnModuleDestroy {
  private readonly openAi: OpenAI;
  private logger: Logger = new Logger(AssistantFlow.name);
  private registeredEvents: Array<{
    event: string;
    callback: (...args: unknown[]) => unknown;
  }> = [];

  constructor(
    private readonly assistantClass: BaseAssistant,
    private params: {
      threadId: string;
      assistantId: string;
      message: string;
    },
  ) {
    super();
    this.openAi = new OpenAI();

    const onOpenAiEvent = async (event: AssistantStreamEvent) => {
      this.logger.log('event', event.event);
      if (event.event === 'thread.run.requires_action') {
        await this.handleRequiresAction(
          event.data,
          event.data.id,
          event.data.thread_id,
        );
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    this.on('event', onOpenAiEvent);
    this.registeredEvents.push({ event: 'event', callback: onOpenAiEvent });

    const eventsInFlowClass =
      AssistantProcessDecoratorService.exploreMethodsByMetadata(
        this.assistantClass,
        ASSISTANT_EVENT_METADATA,
      );

    if (eventsInFlowClass) {
      eventsInFlowClass.forEach(({ eventOrToolName, method }) => {
        this.on(eventOrToolName, method);
        this.registeredEvents.push({
          event: eventOrToolName,
          callback: method,
        });
      });
    }
  }

  async run() {
    try {
      await this.openAi.beta.threads.messages.create(this.params.threadId, {
        role: 'user',
        content: this.params.message,
      });

      const run = this.openAi.beta.threads.runs.stream(this.params.threadId, {
        assistant_id: this.params.assistantId,
      });

      for await (const event of run) {
        //console.log(event);
        await this.emitAndWait('event', event);
        await this.emitAndWait(event.event, event);
      }

      this.logger.log('Streaming finalizado. Disposing handlers.');
      this.dispose();
    } catch (error) {
      this.logger.error('Erro no streaming', error);
      this.dispose();
    }
  }

  private async emitAndWait(event: string, payload: unknown): Promise<void> {
    const listeners = this.listeners(event);

    if (listeners.length === 0) {
      return;
    }

    await Promise.all(
      listeners.map((listener) => {
        try {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call
          const result = listener(payload);
          if (result instanceof Promise) {
            return result;
          }
          return Promise.resolve(result);
        } catch (error) {
          this.logger.error(`Erro no listener do evento "${event}":`, error);
          // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
          return Promise.reject(error);
        }
      }),
    );
  }

  async handleRequiresAction(
    data: OpenAI.Beta.Threads.Runs.Run,
    runId: string,
    threadId: string,
  ) {
    const toolOutputs = await Promise.all(
      data.required_action?.submit_tool_outputs.tool_calls.map(
        async (toolCall) => {
          const args: unknown = JSON.parse(
            toolCall.function?.arguments ?? '{}',
          );

          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const output: any = await Promise.race([
            this.handleToolCall(this.assistantClass, {
              name: toolCall.function.name,
              arguments: args,
            }),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Timeout na função')), 10_000),
            ),
          ]);

          return {
            tool_call_id: toolCall.id,
            output:
              typeof output === 'string' ? output : JSON.stringify(output),
          };
        },
      ) ?? [],
    );

    await this.submitToolOutputs(toolOutputs, runId, threadId);
  }

  async submitToolOutputs(
    toolOutputs: unknown,
    runId: string,
    threadId: string,
  ) {
    const stream = this.openAi.beta.threads.runs.submitToolOutputsStream(
      threadId,
      runId,
      // @ts-ignore
      { tool_outputs: toolOutputs },
    );

    for await (const event of stream) {
      await this.emitAndWait('event', event);
      await this.emitAndWait(event.event, event);
    }
  }

  async handleToolCall(
    toolsInstance: any,
    toolCall: { name: string; arguments: any },
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const method = AssistantProcessDecoratorService.findMethodByToolName(
      toolsInstance,
      toolCall.name,
    );

    // Agora chama dinamicamente o método
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-return
    return await method(toolCall.arguments);
  }

  dispose() {
    this.registeredEvents.forEach(({ event, callback }) => {
      this.off(event, callback);
    });
    this.registeredEvents = [];
    this.logger.log('All listeners removed and disposed.');
  }

  onModuleDestroy() {
    this.dispose();
  }
}
