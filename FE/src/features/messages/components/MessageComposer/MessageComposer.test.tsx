import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MessageComposer } from './MessageComposer.tsx'
import { MessageThreadProvider } from '../MessageThread/context/useMessageThreadContext.tsx'
import type { UseMessageThreadScreenValue } from '../MessageThread/context/useMessageThreadContext.types.ts'

const mockThreadValue: UseMessageThreadScreenValue = {
  threadState: { status: 'success' },
  threadMessages: [],
  conversationTitle: null,
  isTutorConversation: false,
  senders: [],
  scrollContainerRef: { current: null },
  hasMoreOlderMessages: false,
  isLoadingOlderMessages: false,
  loadOlderMessagesError: null,
  loadOlderMessages: () => {},
  refetchMessages: () => {},
  messageDraft: '',
  onMessageDraftChange: () => {},
  handleSendMessage: () => {},
  isReady: true,
  isSendingMessage: false,
  isComposerDisabled: false,
  isSendDisabled: false,
}

vi.mock('../MessageThread/hooks/useMessageThreadScreen.ts', () => ({
  useMessageThreadScreen: (): UseMessageThreadScreenValue => mockThreadValue,
}))

describe('MessageComposer', () => {
  beforeEach(() => {
    mockThreadValue.messageDraft = ''
    mockThreadValue.handleSendMessage = () => {}
    mockThreadValue.onMessageDraftChange = () => {}
    mockThreadValue.isComposerDisabled = false
    mockThreadValue.isSendDisabled = false
  })

  it('submits on Enter without Shift', async () => {
    const user = userEvent.setup()
    const onSendMessage = vi.fn()
    mockThreadValue.messageDraft = 'Hello'
    mockThreadValue.handleSendMessage = onSendMessage

    render(
      <MessageThreadProvider>
        <MessageComposer />
      </MessageThreadProvider>,
    )

    const messageInput = screen.getByRole('textbox', { name: /message input/i })
    await user.click(messageInput)
    await user.keyboard('{Enter}')

    expect(onSendMessage).toHaveBeenCalledOnce()
  })

  it('does not submit on Shift+Enter', async () => {
    const user = userEvent.setup()
    const onSendMessage = vi.fn()
    mockThreadValue.messageDraft = 'Hello'
    mockThreadValue.handleSendMessage = onSendMessage

    render(
      <MessageThreadProvider>
        <MessageComposer />
      </MessageThreadProvider>,
    )

    const messageInput = screen.getByRole('textbox', { name: /message input/i })
    await user.click(messageInput)
    await user.keyboard('{Shift>}{Enter}{/Shift}')

    expect(onSendMessage).not.toHaveBeenCalled()
  })
})
