import { isRecord, parseCitation, parseSendMessageResponse } from './parseApiResponse.ts'
import type { ApiErrorPayload } from '../types/api.ts'
import type { Citation, Message } from '../types/domain.ts'

export type AssistantStreamHandlers = {
  onUserMessage: (message: Message) => void
  onToken: (text: string) => void
  onTool: (name: string) => void
  onCitations: (citations: Citation[]) => void
  onDone: (message: Message) => void
  onError: (error: ApiErrorPayload) => void
}

// Reads a text/event-stream body and dispatches each frame to the handlers. Unknown
// event names are ignored, so the backend can add event types (citations, tool calls)
// in later weeks without breaking this client.
export async function consumeAssistantStream(
  response: Response,
  handlers: AssistantStreamHandlers,
): Promise<void> {
  if (response.body === null) {
    throw new Error('Assistant stream response had no body')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  try {
    for (;;) {
      const { done, value } = await reader.read()
      if (done) {
        break
      }
      buffer += decoder.decode(value, { stream: true })

      let separatorIndex = buffer.indexOf('\n\n')
      while (separatorIndex !== -1) {
        dispatchFrame(buffer.slice(0, separatorIndex), handlers)
        buffer = buffer.slice(separatorIndex + 2)
        separatorIndex = buffer.indexOf('\n\n')
      }
    }
    if (buffer.trim().length > 0) {
      dispatchFrame(buffer, handlers)
    }
  } finally {
    reader.releaseLock()
  }
}

function dispatchFrame(frame: string, handlers: AssistantStreamHandlers): void {
  let eventName = ''
  const dataLines: string[] = []
  for (const line of frame.split('\n')) {
    if (line.startsWith('event:')) {
      eventName = line.slice('event:'.length).trim()
    } else if (line.startsWith('data:')) {
      dataLines.push(line.slice('data:'.length).trim())
    }
  }
  // Per the SSE spec, multiple data: lines in one frame join with a newline.
  const rawData = dataLines.join('\n')
  if (eventName === '' || rawData === '') {
    return
  }

  const data: unknown = JSON.parse(rawData)
  switch (eventName) {
    case 'user_message':
      handlers.onUserMessage(parseSendMessageResponse(data).message)
      break
    case 'token':
      if (isRecord(data) && typeof data.text === 'string') {
        handlers.onToken(data.text)
      }
      break
    case 'tool':
      if (isRecord(data) && typeof data.name === 'string') {
        handlers.onTool(data.name)
      }
      break
    case 'citations':
      if (isRecord(data) && Array.isArray(data.citations)) {
        handlers.onCitations(
          data.citations.map((entry, index) =>
            parseCitation(entry, `citations[${index}]`),
          ),
        )
      }
      break
    case 'done':
      handlers.onDone(parseSendMessageResponse(data).message)
      break
    case 'error':
      handlers.onError(toErrorPayload(data))
      break
    default:
      // Forward-compatible: ignore event types this client doesn't know yet.
      break
  }
}

function toErrorPayload(data: unknown): ApiErrorPayload {
  if (isRecord(data) && typeof data.code === 'string' && typeof data.message === 'string') {
    return { code: data.code, message: data.message, details: data.details }
  }
  return { code: 'ASSISTANT_UNAVAILABLE', message: 'The assistant is currently unavailable.' }
}
