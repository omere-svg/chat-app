import type { AssistantStreamEvent } from './types/assistant-stream-event.js'

export function serializeAssistantStreamEvent(streamEvent: AssistantStreamEvent): string {
  return `event: ${streamEvent.event}\ndata: ${JSON.stringify(streamEvent.data)}\n\n`
}
