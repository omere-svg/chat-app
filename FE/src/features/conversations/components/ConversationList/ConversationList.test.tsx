import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ConversationListContainer } from './ConversationListContainer.tsx'

describe('ConversationListContainer', () => {
  it('shows empty state when there are no conversations', () => {
    render(
      <ConversationListContainer
        conversationsState={{ status: 'empty' }}
        selectedConversationId={null}
        onSelectConversation={vi.fn()}
      />,
    )

    expect(screen.getByText('No conversations')).toBeInTheDocument()
  })

  it('renders conversations on success', () => {
    render(
      <ConversationListContainer
        conversationsState={{
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
        }}
        selectedConversationId="conv-1"
        onSelectConversation={vi.fn()}
      />,
    )

    expect(screen.getByText('Team chat')).toBeInTheDocument()
  })
})
