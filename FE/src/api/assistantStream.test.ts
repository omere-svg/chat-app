import { describe, expect, it, vi } from 'vitest'
import { consumeAssistantStream } from './assistantStream.ts'
import type { AssistantStreamHandlers } from './assistantStream.ts'
import type { Citation } from '../types/domain.ts'

function streamingResponse(chunks: string[]): Response {
  const encoder = new TextEncoder()
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(chunk))
      }
      controller.close()
    },
  })
  return new Response(body, { headers: { 'Content-Type': 'text/event-stream' } })
}

function buildHandlers(): AssistantStreamHandlers & {
  calls: { tokens: string[]; tools: string[]; citations: Citation[][] }
} {
  const calls = {
    tokens: [] as string[],
    tools: [] as string[],
    citations: [] as Citation[][],
  }
  return {
    calls,
    onUserMessage: vi.fn(),
    onToken: vi.fn((text: string) => calls.tokens.push(text)),
    onTool: vi.fn((name: string) => calls.tools.push(name)),
    onCitations: vi.fn((citations: Citation[]) => calls.citations.push(citations)),
    onDone: vi.fn(),
    onError: vi.fn(),
  }
}

const userMessageFrame =
  'event: user_message\ndata: {"message":{"id":"msg-u","conversationId":"c","senderId":"user-1","body":"hi","createdAt":"2026-01-01T00:00:00.000Z"}}\n\n'
const doneFrame =
  'event: done\ndata: {"message":{"id":"msg-a","conversationId":"c","senderId":"assistant","body":"Hi there","createdAt":"2026-01-01T00:00:02.000Z"}}\n\n'

describe('consumeAssistantStream', () => {
  it('dispatches user_message, tokens, tool, and done in order — across split chunks', async () => {
    const handlers = buildHandlers()
    // Deliberately split a frame across two network chunks to exercise buffering.
    const response = streamingResponse([
      userMessageFrame + 'event: tool\ndata: {"name":"list_my_convers',
      'ations"}\n\nevent: token\ndata: {"text":"Hi "}\n\nevent: token\ndata: {"text":"there"}\n\n',
      doneFrame,
    ])

    await consumeAssistantStream(response, handlers)

    expect(handlers.onUserMessage).toHaveBeenCalledOnce()
    expect(handlers.calls.tools).toEqual(['list_my_conversations'])
    expect(handlers.calls.tokens).toEqual(['Hi ', 'there'])
    expect(handlers.onDone).toHaveBeenCalledOnce()
    expect(handlers.onError).not.toHaveBeenCalled()
  })

  it('ignores unknown event types (forward-compatible)', async () => {
    const handlers = buildHandlers()
    const response = streamingResponse([
      'event: progress\ndata: {"step":"retrieving"}\n\n',
      'event: usage\ndata: {"tokens":42}\n\n',
      doneFrame,
    ])

    await consumeAssistantStream(response, handlers)

    expect(handlers.onDone).toHaveBeenCalledOnce()
    expect(handlers.onToken).not.toHaveBeenCalled()
    expect(handlers.onError).not.toHaveBeenCalled()
  })

  it('parses a citations event into the onCitations handler', async () => {
    const handlers = buildHandlers()
    const citationsFrame =
      'event: citations\ndata: {"citations":[{"chunkId":"k1","documentId":"d1",' +
      '"documentName":"notes.md","text":"Venus is hottest.","score":0.91}]}\n\n'
    const response = streamingResponse([userMessageFrame, citationsFrame, doneFrame])

    await consumeAssistantStream(response, handlers)

    expect(handlers.calls.citations).toEqual([
      [
        {
          chunkId: 'k1',
          documentId: 'd1',
          documentName: 'notes.md',
          text: 'Venus is hottest.',
          score: 0.91,
        },
      ],
    ])
    expect(handlers.onDone).toHaveBeenCalledOnce()
  })

  it('routes an error event to onError', async () => {
    const handlers = buildHandlers()
    const response = streamingResponse([
      userMessageFrame,
      'event: error\ndata: {"code":"ASSISTANT_UNAVAILABLE","message":"down"}\n\n',
    ])

    await consumeAssistantStream(response, handlers)

    expect(handlers.onError).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'ASSISTANT_UNAVAILABLE', message: 'down' }),
    )
    expect(handlers.onDone).not.toHaveBeenCalled()
  })
})
