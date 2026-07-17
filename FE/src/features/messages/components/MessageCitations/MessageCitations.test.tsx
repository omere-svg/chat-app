import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MessageCitationsContainer } from './MessageCitationsContainer.tsx'
import type { Citation } from '@/types/domain.ts'

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

describe('MessageCitations', () => {
  it('lists every source with a one-line preview, hiding the full text until expanded', () => {
    render(<MessageCitationsContainer citations={citations} />)

    expect(screen.getByText('Sources (2)')).toBeInTheDocument()
    expect(
      screen.getByText(/Venus is the hottest planet in the Solar System/),
    ).toBeInTheDocument()
    expect(screen.queryByText(citations[0]!.text)).not.toBeInTheDocument()
  })

  it('expands a source on click to reveal its full chunk text', async () => {
    const user = userEvent.setup()
    render(<MessageCitationsContainer citations={citations} />)

    await user.click(screen.getByRole('button', { name: /91%/ }))

    expect(screen.getByText(citations[0]!.text)).toBeInTheDocument()
    expect(screen.queryByText(citations[1]!.text)).not.toBeInTheDocument()
  })

  it('toggles a source open and closed with the keyboard', async () => {
    const user = userEvent.setup()
    render(<MessageCitationsContainer citations={citations} />)

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
