import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ConversationListContainer } from './ConversationListContainer.tsx'
import type { ChatLayoutContextValue } from '@/app/components/ChatLayout/ChatLayout.types.ts'

const { mockUseChatLayout } = vi.hoisted(() => ({
  mockUseChatLayout: vi.fn(),
}))

vi.mock('@/app/components/ChatLayout/context/useChatLayoutContext.tsx', () => ({
  useChatLayout: () => mockUseChatLayout() as ChatLayoutContextValue,
}))

function setChatLayout(overrides: Partial<ChatLayoutContextValue>): void {
  mockUseChatLayout.mockReturnValue({
    conversationsState: { status: 'empty' },
    conversations: [],
    selectedConversationId: null,
    selectConversation: vi.fn(),
    reloadConversations: vi.fn(),
    selectCreatedConversation: vi.fn(),
    ...overrides,
  })
}

afterEach(() => {
  mockUseChatLayout.mockReset()
})

describe('ConversationListContainer', () => {
  it('shows empty state when there are no conversations', () => {
    setChatLayout({ conversationsState: { status: 'empty' } })

    render(<ConversationListContainer />)

    expect(screen.getByText('No conversations')).toBeInTheDocument()
  })

  it('renders conversations on success', () => {
    setChatLayout({
      conversationsState: {
        status: 'success',
        conversations: [
          {
            id: 'conv-1',
            type: 'direct',
            title: 'Team chat',
            participantIds: ['user-alice'],
            participants: [],
            lastMessage: null,
            updatedAt: '2026-01-01T12:00:00.000Z',
          },
        ],
      },
      selectedConversationId: 'conv-1',
    })

    render(<ConversationListContainer />)

    expect(screen.getByText('Team chat')).toBeInTheDocument()
  })
})
