import type { MessageRecord } from '../messages/message.entity.js'
import type { ErrorCode } from '../shared/errors/error-codes.constant.js'

// The SSE event union sent to the client over the streaming POST. Named events keep
// the contract forward-compatible: weeks 7-8 add `citations` / `tool_call` / `progress`
// as new members, and a tolerant client parser ignores event names it does not know.
export type AssistantStreamEvent =
  | { event: 'user_message'; data: { message: MessageRecord } }
  | { event: 'token'; data: { text: string } }
  | { event: 'tool'; data: { name: string } }
  | { event: 'done'; data: { message: MessageRecord } }
  | { event: 'error'; data: { code: ErrorCode; message: string } }

// Serializes one event as an SSE frame. `event:` carries the type; `data:` is a single
// JSON line; the blank line terminates the frame.
export function serializeAssistantStreamEvent(streamEvent: AssistantStreamEvent): string {
  return `event: ${streamEvent.event}\ndata: ${JSON.stringify(streamEvent.data)}\n\n`
}
