import { SetMetadata } from '@nestjs/common';

export const TOOL_NAME_METADATA = 'tool:name';
export const ASSISTANT_EVENT_METADATA = 'assistant:event';

export function ToolName(name: string) {
  return SetMetadata(TOOL_NAME_METADATA, name);
}

export function AssistantEvent(name: string) {
  return SetMetadata(ASSISTANT_EVENT_METADATA, name);
}
