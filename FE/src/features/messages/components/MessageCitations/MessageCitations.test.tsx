import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MessageCitationsContainer } from './MessageCitationsContainer.tsx'
import { MessageBubbleProvider } from '../MessageBubble/context/useMessageBubbleContext.tsx'
import type { Citation, Message } from '@/types/domain.ts'
import type { MessageBubbleContextValue } from '../MessageBubble/context/useMessageBubbleContext.types.ts'

const citations: Citation[] = [
  {
    chunkId: 'k1',
    documentId: 'd1',
    documentName: 'solar.md',
    text: 'Venus is the hottest planet in the Solar System, with an average surface temperature near 465 degrees Celsius caused by a runaway greenhouse effect.',
    score: 0.91,
  },
  {
    chunkId: 'k2',
    documentId: 'd1',
    documentName: 'solar.md',
    text: 'It has a thick carbon dioxide atmosphere that traps heat, which is why it is hotter than Mercury despite being farther from the Sun.',
    score: 0.78,
  },
]

const mockBubbleValue: MessageBubbleContextValue = {
  senderName: 'Assistant',
  avatarUrl: null,
  rowClassName: '',
  bubbleClassName: '',
  body: '',
  showCursor: false,
  isPending: false,
  isStreaming: false,
  createdAt: '2024-01-01T00:00:00.000Z',
  tools: [],
  completedTools: [],
  citations,
  metaStatusLabel: '',
  metaIsLive: false,
  metaTimeLabel: '',
  metaDateTime: '2024-01-01T00:00:00.000Z',
}

vi.mock('../MessageBubble/hooks/useMessageBubble.ts', () => ({
  useMessageBubble: (): MessageBubbleContextValue => mockBubbleValue,
}))

const message: Message = {
  id: 'msg-1',
  conversationId: 'conv-1',
  senderId: 'assistant',
  body: '',
  createdAt: '2024-01-01T00:00:00.000Z',
}

function renderCitations(): void {
  render(
    <MessageBubbleProvider message={message}>
      <MessageCitationsContainer />
    </MessageBubbleProvider>,
  )
}

describe('MessageCitations', () => {
  it('lists every source with a one-line preview, hiding the full text until expanded', () => {
    renderCitations()

    expect(screen.getByText('Sources (2)')).toBeInTheDocument()
    expect(
      screen.getByText(/Venus is the hottest planet in the Solar System/),
    ).toBeInTheDocument()
    expect(screen.queryByText(citations[0]!.text)).not.toBeInTheDocument()
  })

  it('expands a source on click to reveal its full chunk text', async () => {
    const user = userEvent.setup()
    renderCitations()

    await user.click(screen.getByRole('button', { name: /91%/ }))

    expect(screen.getByText(citations[0]!.text)).toBeInTheDocument()
    expect(screen.queryByText(citations[1]!.text)).not.toBeInTheDocument()
  })

  it('toggles a source open and closed with the keyboard', async () => {
    const user = userEvent.setup()
    renderCitations()

    const toggle = screen.getByRole('button', { name: /91%/ })
    toggle.focus()
    await user.keyboard('{Enter}')
    expect(screen.getByText(citations[0]!.text)).toBeInTheDocument()
    expect(toggle).toHaveAttribute('aria-expanded', 'true')

    await user.keyboard('{Enter}')
    expect(screen.queryByText(citations[0]!.text)).not.toBeInTheDocument()
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })
})
