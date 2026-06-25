import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ConversationList } from './ConversationList.tsx'

describe('ConversationList', () => {
  it('shows empty state when there are no conversations', () => {
    render(
      <ConversationList
        conversationsState={{ status: 'empty' }}
        selectedConversationId={null}
        onSelectConversation={vi.fn()}
      />,
    )

    expect(screen.getByText('No conversations')).toBeInTheDocument()
  })

  it('renders conversations on success', () => {
    render(
      <ConversationList
        conversationsState={{
          status: 'success',
          conversations: [
            {
              id: 'conv-1',
              type: 'direct',
              title: 'Team chat',
              participantIds: ['user-alice'],
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
