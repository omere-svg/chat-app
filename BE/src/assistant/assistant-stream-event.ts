import type { MessageCitation, MessageRecord } from '../messages/message.entity.js'
import type { ErrorCode } from '../shared/errors/error-codes.constant.js'

// The SSE event union sent to the client over the streaming POST. Named events keep
// the contract forward-compatible: a tolerant client parser ignores event names it
// does not know. Week 7 adds `citations`, emitted by tutor replies before `done`.
export type AssistantStreamEvent =
  | { event: 'user_message'; data: { message: MessageRecord } }
  | { event: 'token'; data: { text: string } }
  | { event: 'tool'; data: { name: string } }
  | { event: 'citations'; data: { citations: MessageCitation[] } }
  | { event: 'done'; data: { message: MessageRecord } }
  | { event: 'error'; data: { code: ErrorCode; message: string } }

// Serializes one event as an SSE frame. `event:` carries the type; `data:` is a single
// JSON line; the blank line terminates the frame.
export function serializeAssistantStreamEvent(streamEvent: AssistantStreamEvent): string {
  return `event: ${streamEvent.event}\ndata: ${JSON.stringify(streamEvent.data)}\n\n`
}
