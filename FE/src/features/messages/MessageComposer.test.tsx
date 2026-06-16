import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MessageComposer } from './MessageComposer.tsx'

describe('MessageComposer', () => {
  it('submits on Enter without Shift', async () => {
    const user = userEvent.setup()
    const onSendMessage = vi.fn()

    render(
      <MessageComposer
        messageDraft="Hello"
        onMessageDraftChange={vi.fn()}
        onSendMessage={onSendMessage}
      />,
    )

    const messageInput = screen.getByRole('textbox', { name: /message input/i })
    await user.click(messageInput)
    await user.keyboard('{Enter}')

    expect(onSendMessage).toHaveBeenCalledOnce()
  })

  it('does not submit on Shift+Enter', async () => {
    const user = userEvent.setup()
    const onSendMessage = vi.fn()

    render(
      <MessageComposer
        messageDraft=""
        onMessageDraftChange={vi.fn()}
        onSendMessage={onSendMessage}
      />,
    )

    const messageInput = screen.getByRole('textbox', { name: /message input/i })
    await user.click(messageInput)
    await user.keyboard('{Shift>}{Enter}{/Shift}')

    expect(onSendMessage).not.toHaveBeenCalled()
  })
})
