import { describe, expect, it } from 'vitest'
import { ConversationParticipantsMapper } from '../chat/mapper/conversation-participants.mapper.js'
import type { PublicUser } from '../users/user-public-view.js'

const creator: PublicUser = { id: 'user-b', email: 'b@example.com', firstName: 'Bea', lastName: 'Baxter' }
const alice: PublicUser = { id: 'user-a', email: 'a@example.com', firstName: 'Alice', lastName: 'Adams' }
const cleo: PublicUser = { id: 'user-c', email: 'c@example.com', firstName: 'Cleo', lastName: 'Cole' }

const mapper = new ConversationParticipantsMapper()

describe('ConversationParticipantsMapper', () => {
  it('includes the creator, dedupes by id, and sorts ids ascending', () => {
    const { participantIds } = mapper.shape(creator, [cleo, alice, creator], undefined)

    expect(participantIds).toEqual(['user-a', 'user-b', 'user-c'])
  })

  it('derives a default title from sorted participant full names', () => {
    const { title } = mapper.shape(creator, [cleo, alice], undefined)

    expect(title).toBe('Alice Adams & Bea Baxter & Cleo Cole')
  })

  it('trims an explicitly requested title and keeps it', () => {
    const { title } = mapper.shape(creator, [alice], '  Project Sync  ')

    expect(title).toBe('Project Sync')
  })
})
