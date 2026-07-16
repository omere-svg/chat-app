import { ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { beforeEach, describe, expect, it } from 'vitest'
import { UsersService } from '../users/users.service.js'
import type { PasswordHasher } from '../users/password-hasher.js'
import type { UserRepository, UserUpdate } from '../users/repository/user-repository.port.js'
import type { UserRecord } from '../users/user.entity.js'

const EXISTING_USER: UserRecord = {
  id: 'user-1',
  email: 'old@example.com',
  passwordHash: 'hash:correct-password',
  firstName: 'Old',
  lastName: 'Name',
}

// In-memory repository seeded with EXISTING_USER plus a second account whose email is
// already taken, so the conflict path can be exercised.
function buildRepository(): UserRepository {
  const users = new Map<string, UserRecord>([
    [EXISTING_USER.id, { ...EXISTING_USER }],
    [
      'user-2',
      {
        id: 'user-2',
        email: 'taken@example.com',
        passwordHash: 'hash:other',
        firstName: 'Taken',
        lastName: 'Owner',
      },
    ],
  ])

  return {
    isEmpty: () => Promise.resolve(users.size === 0),
    findById: (userId) => Promise.resolve(users.get(userId) ?? null),
    findByEmail: (email) =>
      Promise.resolve([...users.values()].find((user) => user.email === email) ?? null),
    findByEmails: () => Promise.resolve([]),
    findByIds: (ids) =>
      Promise.resolve(ids.map((id) => users.get(id)).filter((user) => user !== undefined)),
    insert: (userRecord) => {
      users.set(userRecord.id, userRecord)
      return Promise.resolve(userRecord)
    },
    update: (userId: string, patch: UserUpdate) => {
      const existing = users.get(userId)
      if (existing === undefined) {
        return Promise.resolve(null)
      }
      const updated = { ...existing, ...patch }
      users.set(userId, updated)
      return Promise.resolve(updated)
    },
  }
}

// Deterministic stand-in for bcrypt: a hash is `hash:<password>` and verification is a
// plain string comparison, keeping the spec fast and free of crypto flakiness.
const passwordHasher: PasswordHasher = {
  hash: (plain: string) => Promise.resolve(`hash:${plain}`),
  verify: (plain: string, hash: string) => Promise.resolve(hash === `hash:${plain}`),
}

describe('UsersService profile updates', () => {
  let usersService: UsersService

  beforeEach(() => {
    usersService = new UsersService(buildRepository(), passwordHasher)
  })

  describe('updateName', () => {
    it('trims and persists the new first and last name', async () => {
      const result = await usersService.updateName('user-1', {
        firstName: '  Ada  ',
        lastName: '  Lovelace  ',
      })

      expect(result).toMatchObject({ id: 'user-1', firstName: 'Ada', lastName: 'Lovelace' })
      expect(result).not.toHaveProperty('passwordHash')
    })

    it('throws NotFound for an unknown user', async () => {
      await expect(
        usersService.updateName('ghost', { firstName: 'No', lastName: 'One' }),
      ).rejects.toBeInstanceOf(NotFoundException)
    })
  })

  describe('updateEmail', () => {
    it('changes the email when the current password is correct and the email is free', async () => {
      const result = await usersService.updateEmail('user-1', {
        email: 'New@Example.com',
        currentPassword: 'correct-password',
      })

      // Email is normalized to lowercase on save.
      expect(result.email).toBe('new@example.com')
    })

    it('rejects a wrong current password with Unauthorized', async () => {
      await expect(
        usersService.updateEmail('user-1', {
          email: 'new@example.com',
          currentPassword: 'wrong-password',
        }),
      ).rejects.toBeInstanceOf(UnauthorizedException)
    })

    it('rejects an email already registered to another account with Conflict', async () => {
      await expect(
        usersService.updateEmail('user-1', {
          email: 'taken@example.com',
          currentPassword: 'correct-password',
        }),
      ).rejects.toBeInstanceOf(ConflictException)
    })

    it('is a no-op that returns the user when the email is unchanged', async () => {
      const result = await usersService.updateEmail('user-1', {
        email: 'old@example.com',
        currentPassword: 'correct-password',
      })

      expect(result.email).toBe('old@example.com')
    })
  })
})
