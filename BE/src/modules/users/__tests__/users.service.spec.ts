import { beforeEach, describe, expect, it } from 'vitest'
import { UsersService } from '../users.service.js'
import { UserNotFoundError } from '../errors/user-not-found.error.js'
import { EmailAlreadyRegisteredError } from '../errors/email-already-registered.error.js'
import { MAX_PREVIOUS_EMAILS } from '../constants.js'
import type { PasswordHasher } from '../password-hasher.js'
import type { UserRepository } from '../user.repository.js'
import type { ConfirmedEmailChange, UserRecord, UserUpdate } from '../types/user.entity.js'

const EXISTING_USER: UserRecord = {
  id: 'user-1',
  email: 'old@example.com',
  passwordHash: 'hash:correct-password',
  firstName: 'Old',
  lastName: 'Name',
  avatar: null,
  previousEmails: [],
}

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
        avatar: null,
        previousEmails: [],
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
    applyConfirmedEmailChange: ({ userId, newEmail }: ConfirmedEmailChange) => {
      const existing = users.get(userId)
      if (existing === undefined) {
        return Promise.resolve({ outcome: 'not-found' })
      }
      if (existing.email === newEmail) {
        return Promise.resolve({ outcome: 'user', user: existing })
      }
      const owner = [...users.values()].find(
        (user) => user.email === newEmail && user.id !== userId,
      )
      if (owner !== undefined) {
        return Promise.resolve({ outcome: 'email-taken' })
      }
      const previousEmails = [...existing.previousEmails, existing.email].slice(
        -MAX_PREVIOUS_EMAILS,
      )
      const updated = { ...existing, email: newEmail, previousEmails }
      users.set(userId, updated)
      return Promise.resolve({ outcome: 'user', user: updated })
    },
  }
}

const passwordHasher: PasswordHasher = {
  hash: (plain: string) => Promise.resolve(`hash:${plain}`),
  verify: (plain: string, hash: string) => Promise.resolve(hash === `hash:${plain}`),
}

describe('UsersService', () => {
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
      ).rejects.toBeInstanceOf(UserNotFoundError)
    })
  })

  describe('applyConfirmedEmailChange', () => {
    it('sets the new email and pushes the old one onto previousEmails', async () => {
      const result = await usersService.applyConfirmedEmailChange('user-1', 'New@Example.com')

      expect(result.email).toBe('new@example.com')
      expect(await usersService.getPreviousEmails('user-1')).toEqual(['old@example.com'])
    })

    it('is an idempotent no-op when the email already equals the target (replay)', async () => {
      await usersService.applyConfirmedEmailChange('user-1', 'new@example.com')
      const replay = await usersService.applyConfirmedEmailChange('user-1', 'new@example.com')

      expect(replay.email).toBe('new@example.com')
      expect(await usersService.getPreviousEmails('user-1')).toEqual(['old@example.com'])
    })

    it('rejects an email already registered to another account', async () => {
      await expect(
        usersService.applyConfirmedEmailChange('user-1', 'taken@example.com'),
      ).rejects.toBeInstanceOf(EmailAlreadyRegisteredError)
    })

    it('keeps a raw FIFO window of at most 10 previous emails including duplicates', async () => {
      for (let index = 1; index <= 12; index++) {
        await usersService.applyConfirmedEmailChange('user-1', `email-${index.toString()}@example.com`)
      }
      await usersService.applyConfirmedEmailChange('user-1', 'old@example.com')

      const previousEmails = await usersService.getPreviousEmails('user-1')
      expect(previousEmails).toHaveLength(MAX_PREVIOUS_EMAILS)
      expect(previousEmails.at(-1)).toBe('email-12@example.com')
      expect(previousEmails).not.toContain('old@example.com')
    })

    it('maps an email-taken repository outcome without inspecting Mongo errors', async () => {
      const racyRepository = {
        ...buildRepository(),
        findByEmail: () => Promise.resolve(null),
        applyConfirmedEmailChange: () => Promise.resolve({ outcome: 'email-taken' as const }),
      } as unknown as UserRepository
      const service = new UsersService(racyRepository, passwordHasher)

      await expect(
        service.applyConfirmedEmailChange('user-1', 'free@example.com'),
      ).rejects.toBeInstanceOf(EmailAlreadyRegisteredError)
    })

    it('throws NotFound for an unknown user', async () => {
      await expect(
        usersService.applyConfirmedEmailChange('ghost', 'x@example.com'),
      ).rejects.toBeInstanceOf(UserNotFoundError)
    })

    it('throws NotFound before checking ownership when an unknown user targets a taken email', async () => {
      await expect(
        usersService.applyConfirmedEmailChange('ghost', 'taken@example.com'),
      ).rejects.toBeInstanceOf(UserNotFoundError)
    })
  })

  describe('getPreviousEmails', () => {
    it('throws NotFound for an unknown user', async () => {
      await expect(usersService.getPreviousEmails('ghost')).rejects.toBeInstanceOf(
        UserNotFoundError,
      )
    })
  })

  describe('resolveExistingUsersByEmails', () => {
    it('matches a normalized request to a mixed-case stored email', async () => {
      const repository = {
        ...buildRepository(),
        findByEmails: () =>
          Promise.resolve([{ ...EXISTING_USER, email: 'Alice@Example.com' }]),
      } as UserRepository
      const service = new UsersService(repository, passwordHasher)

      const users = await service.resolveExistingUsersByEmails(['alice@example.com'])

      expect(users).toMatchObject([{ id: EXISTING_USER.id, email: 'Alice@Example.com' }])
    })
  })
})
