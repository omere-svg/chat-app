import { describe, expect, it, vi } from 'vitest'
import { AIMessage, AIMessageChunk } from '@langchain/core/messages'
import { BaseChatModel } from '@langchain/core/language_models/chat_models'
import { ChatGenerationChunk } from '@langchain/core/outputs'
import { MemorySaver } from '@langchain/langgraph'
import { buildAgentGraph } from '../agent/agent.graph.js'
import { LangGraphAgentStrategy } from '../agent/langgraph-agent.strategy.js'
import { AssistantToolRegistry } from '../assistant/tools/assistant-tool.registry.js'
import { RETRIEVE_KNOWLEDGE_DEFINITION, RETRIEVE_KNOWLEDGE_TOOL } from '../agent/agent.config.js'
import {
  TUTOR_NO_CONTEXT_REPLY,
  TUTOR_SYSTEM_PROMPT,
} from '../knowledge/tutor/tutor-prompt.js'
import {
  TUTOR_RETRIEVAL_MIN_SCORE,
  TUTOR_RETRIEVAL_TOP_K,
} from '../knowledge/tutor/tutor-retrieval.config.js'
import type { ChatOpenAI } from '@langchain/openai'
import type { BaseMessage, ToolCall } from '@langchain/core/messages'
import type { ChatResult } from '@langchain/core/outputs'
import type { CallbackManagerForLLMRun } from '@langchain/core/callbacks/manager'
import type { EmbeddingsProvider } from '../knowledge/ingestion/embeddings.port.js'
import type { VectorRetriever } from '../knowledge/retrieval/vector-retriever.port.js'
import type { RetrievedChunk } from '../knowledge/knowledge-chunk.entity.js'
import type { AssistantTool } from '../assistant/tools/assistant-tool.port.js'
import type { AssistantReplyChunk } from '../assistant/reply-strategy.port.js'

// A chat model whose replies are scripted, so the graph runs deterministically offline.
// Each model call (route via invoke, answer via stream) pops the next scripted response.
interface ScriptedResponse {
  content?: string
  toolCalls?: ToolCall[]
}

class ScriptedChatModel extends BaseChatModel {
  private index = 0

  constructor(private readonly script: ScriptedResponse[]) {
    super({})
  }

  _llmType(): string {
    return 'scripted'
  }

  // Ignore the bound tools; the script decides whether a tool call is emitted.
  override bindTools(): this {
    return this
  }

  // Not used by the graph (invoke goes through the streaming path below) but required by
  // the abstract base; kept consistent for safety.
  _generate(): Promise<ChatResult> {
    const next = this.script[this.index++] ?? { content: 'ok' }
    const message = new AIMessage({ content: next.content ?? '', tool_calls: next.toolCalls ?? [] })
    return Promise.resolve({ generations: [{ text: next.content ?? '', message }] })
  }

  override async *_streamResponseChunks(
    _messages: BaseMessage[],
    _options: this['ParsedCallOptions'],
    runManager?: CallbackManagerForLLMRun,
  ): AsyncGenerator<ChatGenerationChunk> {
    const next = this.script[this.index++] ?? { content: 'ok' }
    if (next.toolCalls && next.toolCalls.length > 0) {
      const message = new AIMessageChunk({
        content: '',
        tool_call_chunks: next.toolCalls.map((call, index) => ({
          name: call.name,
          args: JSON.stringify(call.args ?? {}),
          id: call.id,
          index,
          type: 'tool_call_chunk',
        })),
      })
      yield new ChatGenerationChunk({ text: '', message })
      return
    }
    const text = next.content ?? ''
    for (const piece of text.match(/.{1,4}/g) ?? []) {
      await runManager?.handleLLMNewToken(piece)
      yield new ChatGenerationChunk({ text: piece, message: new AIMessageChunk({ content: piece }) })
    }
  }
}

const fakeEmbeddings: EmbeddingsProvider = {
  embedDocuments: () => Promise.resolve([]),
  embedQuery: () => Promise.resolve([0.1, 0.2, 0.3]),
}

function retrievedChunk(): RetrievedChunk {
  return {
    id: 'kchunk-1',
    documentId: 'kdoc-1',
    documentName: 'notes.md',
    chunkIndex: 0,
    text: 'Venus is the hottest planet.',
    score: 0.91,
  }
}

async function collect(iterable: AsyncIterable<AssistantReplyChunk>): Promise<AssistantReplyChunk[]> {
  const chunks: AssistantReplyChunk[] = []
  for await (const chunk of iterable) {
    chunks.push(chunk)
  }
  return chunks
}

describe('agent graph (tutor grounding)', () => {
  it('forces retrieval and refuses without an LLM answer when nothing is relevant', async () => {
    const retrieveSimilarForUser = vi
      .fn<VectorRetriever['retrieveSimilarForUser']>()
      .mockResolvedValue([])
    const retriever: VectorRetriever = { retrieveSimilarForUser }
    const model = new ScriptedChatModel([
      { toolCalls: [{ name: RETRIEVE_KNOWLEDGE_TOOL, args: { query: 'what is X?' }, id: 'r1', type: 'tool_call' }] },
    ])
    const graph = buildAgentGraph({
      chatModel: model as unknown as ChatOpenAI,
      embeddings: fakeEmbeddings,
      retriever,
      toolRegistry: new AssistantToolRegistry([]),
      checkpointer: new MemorySaver(),
    })
    const strategy = new LangGraphAgentStrategy(
      'tutor',
      graph,
      TUTOR_SYSTEM_PROMPT,
      [RETRIEVE_KNOWLEDGE_DEFINITION],
      true,
    )

    const chunks = await collect(
      strategy.generate({
        userId: 'user-1',
        conversationId: 'conv-empty',
        history: [{ role: 'user', content: 'what is X?' }],
        signal: new AbortController().signal,
      }),
    )

    const text = textOf(chunks)
    expect(text).toBe(TUTOR_NO_CONTEXT_REPLY)
    expect(chunks.some((chunk) => chunk.type === 'citations')).toBe(false)
    expect(retrieveSimilarForUser).toHaveBeenCalledWith({
      userId: 'user-1',
      queryEmbedding: [0.1, 0.2, 0.3],
      limit: TUTOR_RETRIEVAL_TOP_K,
      minScore: TUTOR_RETRIEVAL_MIN_SCORE,
    })
  })

  it('emits citations before a grounded, streamed answer when chunks are found', async () => {
    const retriever: VectorRetriever = {
      retrieveSimilarForUser: vi
        .fn<VectorRetriever['retrieveSimilarForUser']>()
        .mockResolvedValue([retrievedChunk()]),
    }
    const model = new ScriptedChatModel([
      { toolCalls: [{ name: RETRIEVE_KNOWLEDGE_TOOL, args: { query: 'hottest planet' }, id: 'r1', type: 'tool_call' }] },
      { content: 'Venus is hottest.' },
    ])
    const graph = buildAgentGraph({
      chatModel: model as unknown as ChatOpenAI,
      embeddings: fakeEmbeddings,
      retriever,
      toolRegistry: new AssistantToolRegistry([]),
      checkpointer: new MemorySaver(),
    })
    const strategy = new LangGraphAgentStrategy(
      'tutor',
      graph,
      TUTOR_SYSTEM_PROMPT,
      [RETRIEVE_KNOWLEDGE_DEFINITION],
      true,
    )

    const chunks = await collect(
      strategy.generate({
        userId: 'user-1',
        conversationId: 'conv-grounded',
        history: [{ role: 'user', content: 'hottest planet?' }],
        signal: new AbortController().signal,
      }),
    )

    const citationChunk = chunks.find((chunk) => chunk.type === 'citations')
    expect(citationChunk).toEqual({
      type: 'citations',
      citations: [
        {
          chunkId: 'kchunk-1',
          documentId: 'kdoc-1',
          documentName: 'notes.md',
          text: 'Venus is the hottest planet.',
          score: 0.91,
        },
      ],
    })
    // Citations precede the answer tokens.
    const citationIndex = chunks.findIndex((chunk) => chunk.type === 'citations')
    const firstTokenIndex = chunks.findIndex((chunk) => chunk.type === 'text-delta')
    expect(citationIndex).toBeLessThan(firstTokenIndex)
    expect(textOf(chunks)).toBe('Venus is hottest.')
  })
})

describe('agent graph (assistant tools)', () => {
  it('runs a user-data tool scoped to the caller, then answers', async () => {
    const executed: Array<{ name: string; userId: string }> = []
    const listTool: AssistantTool = {
      definition: {
        name: 'list_my_conversations',
        description: 'list',
        parameters: { type: 'object', properties: {}, additionalProperties: false },
      },
      execute: (_input, context) => {
        executed.push({ name: 'list_my_conversations', userId: context.userId })
        return Promise.resolve([{ id: 'conv-1' }])
      },
    }
    const registry = new AssistantToolRegistry([listTool])
    const model = new ScriptedChatModel([
      { toolCalls: [{ name: 'list_my_conversations', args: {}, id: 'c1', type: 'tool_call' }] },
      // Route's second pass: a plain (no-tool) reply signals "go to answer"; discarded.
      { content: 'thinking' },
      { content: 'You have one chat.' },
    ])
    const checkpointer = new MemorySaver()
    const graph = buildAgentGraph({
      chatModel: model as unknown as ChatOpenAI,
      embeddings: fakeEmbeddings,
      retriever: { retrieveSimilarForUser: vi.fn() },
      toolRegistry: registry,
      checkpointer,
    })
    const strategy = new LangGraphAgentStrategy(
      'assistant',
      graph,
      'assistant system prompt',
      registry.definitions(),
      false,
    )

    const chunks = await collect(
      strategy.generate({
        userId: 'user-7',
        conversationId: 'conv-assistant-tool',
        history: [{ role: 'user', content: 'what chats do I have?' }],
        signal: new AbortController().signal,
      }),
    )

    expect(executed).toEqual([{ name: 'list_my_conversations', userId: 'user-7' }])
    expect(chunks.some((chunk) => chunk.type === 'tool-invoked' && chunk.name === 'list_my_conversations')).toBe(true)
    expect(chunks.some((chunk) => chunk.type === 'tool-result' && chunk.name === 'list_my_conversations')).toBe(true)
    expect(textOf(chunks)).toBe('You have one chat.')

    // Checkpoint persisted for this thread, so an interrupted run could resume.
    const tuple = await checkpointer.getTuple({ configurable: { thread_id: 'conv-assistant-tool' } })
    expect(tuple).toBeDefined()
  })
})

function textOf(chunks: AssistantReplyChunk[]): string {
  return chunks
    .filter((chunk): chunk is { type: 'text-delta'; text: string } => chunk.type === 'text-delta')
    .map((chunk) => chunk.text)
    .join('')
}
