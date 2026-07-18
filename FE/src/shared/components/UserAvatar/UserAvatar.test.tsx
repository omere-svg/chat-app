import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { UserAvatarContainer } from './UserAvatarContainer.tsx'

describe('UserAvatarContainer', () => {
  it('renders the image with the name as alt text when a URL is provided', () => {
    render(
      <UserAvatarContainer
        name="Ada Lovelace"
        imageUrl="https://cdn.example/avatar.png"
        size="md"
      />,
    )

    const image = screen.getByRole('img', { name: 'Ada Lovelace' })
    expect(image).toHaveAttribute('src', 'https://cdn.example/avatar.png')
  })

  it('falls back to initials when no image URL is provided', () => {
    render(<UserAvatarContainer name="Ada Lovelace" imageUrl={null} size="md" />)

    expect(screen.getByText('AL')).toBeInTheDocument()
  })

  it('uses a single initial for a one-word name', () => {
    render(<UserAvatarContainer name="Assistant" imageUrl={null} size="sm" />)

    expect(screen.getByText('A')).toBeInTheDocument()
  })
})
