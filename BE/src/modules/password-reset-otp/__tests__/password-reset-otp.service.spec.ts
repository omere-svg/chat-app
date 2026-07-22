import { describe, expect, it, vi } from 'vitest'
import { PasswordResetOtpService } from '../password-reset-otp.service.js'
import { OTP_CODE_LENGTH } from '../constants.js'
import type { OtpCodeHasher } from '../otp-code.hasher.js'
import type { PasswordResetOtpRepository } from '../password-reset-otp.repository.js'
import type { PasswordResetOtpRecord } from '../types/password-reset-otp-record.js'

function buildService(overrides?: {
  repository?: Partial<PasswordResetOtpRepository>
  hasher?: Partial<OtpCodeHasher>
}): {
  service: PasswordResetOtpService
  deleteByUserId: ReturnType<typeof vi.fn>
  insert: ReturnType<typeof vi.fn>
  findActiveByUserId: ReturnType<typeof vi.fn>
  consume: ReturnType<typeof vi.fn>
  hash: ReturnType<typeof vi.fn>
  verify: ReturnType<typeof vi.fn>
} {
  const deleteByUserId = vi.fn().mockResolvedValue(undefined)
  const insert = vi.fn().mockResolvedValue(undefined)
  const findActiveByUserId = vi.fn().mockResolvedValue(null)
  const consume = vi.fn().mockResolvedValue(true)
  const repository: PasswordResetOtpRepository = {
    deleteByUserId,
    insert,
    findActiveByUserId,
    consume,
    ...overrides?.repository,
  }

  const hash = vi.fn().mockImplementation((code: string) => Promise.resolve(`hash:${code}`))
  const verify = vi
    .fn()
    .mockImplementation((code: string, codeHash: string) =>
      Promise.resolve(codeHash === `hash:${code}`),
    )
  const otpCodeHasher: OtpCodeHasher = { hash, verify, ...overrides?.hasher }

  return {
    service: new PasswordResetOtpService(repository, otpCodeHasher),
    deleteByUserId,
    insert,
    findActiveByUserId,
    consume,
    hash,
    verify,
  }
}

function buildRecord(overrides?: Partial<PasswordResetOtpRecord>): PasswordResetOtpRecord {
  return {
    id: 'otp-1',
    userId: 'user-1',
    codeHash: 'hash:123456',
    expiresAt: new Date(Date.now() + 60_000),
    consumedAt: null,
    ...overrides,
  }
}

describe('PasswordResetOtpService', () => {
  describe('issue', () => {
    it('clears prior codes, hashes a numeric code, and stores it with a TTL', async () => {
      const { service, deleteByUserId, insert, hash } = buildService()

      const code = await service.issue('user-1')

      expect(code).toMatch(new RegExp(`^\\d{${OTP_CODE_LENGTH.toString()}}$`))
      expect(deleteByUserId).toHaveBeenCalledWith('user-1')
      expect(hash).toHaveBeenCalledWith(code)
      const stored = insert.mock.calls[0]?.[0] as PasswordResetOtpRecord
      expect(stored.userId).toBe('user-1')
      expect(stored.codeHash).toBe(`hash:${code}`)
      expect(stored.consumedAt).toBeNull()
      expect(stored.expiresAt.getTime()).toBeGreaterThan(Date.now())
    })

    it('clears prior codes before inserting the new one (one active per user)', async () => {
      const order: string[] = []
      const { service } = buildService({
        repository: {
          deleteByUserId: vi.fn().mockImplementation(() => {
            order.push('delete')
            return Promise.resolve()
          }),
          insert: vi.fn().mockImplementation(() => {
            order.push('insert')
            return Promise.resolve()
          }),
        },
      })

      await service.issue('user-1')

      expect(order).toEqual(['delete', 'insert'])
    })
  })

  describe('verifyAndConsume', () => {
    it('returns valid and consumes when the code matches an active record', async () => {
      const { service, consume } = buildService({
        repository: { findActiveByUserId: vi.fn().mockResolvedValue(buildRecord()) },
      })

      const result = await service.verifyAndConsume({ userId: 'user-1', code: '123456' })

      expect(result).toEqual({ outcome: 'valid' })
      expect(consume).toHaveBeenCalledWith('otp-1', expect.any(Date))
    })

    it('returns invalid when there is no active code', async () => {
      const { service, consume } = buildService({
        repository: { findActiveByUserId: vi.fn().mockResolvedValue(null) },
      })

      const result = await service.verifyAndConsume({ userId: 'user-1', code: '123456' })

      expect(result).toEqual({ outcome: 'invalid' })
      expect(consume).not.toHaveBeenCalled()
    })

    it('returns invalid without consuming when the code does not match', async () => {
      const { service, consume } = buildService({
        repository: { findActiveByUserId: vi.fn().mockResolvedValue(buildRecord()) },
      })

      const result = await service.verifyAndConsume({ userId: 'user-1', code: '000000' })

      expect(result).toEqual({ outcome: 'invalid' })
      expect(consume).not.toHaveBeenCalled()
    })

    it('returns invalid when the record was consumed concurrently', async () => {
      const { service } = buildService({
        repository: {
          findActiveByUserId: vi.fn().mockResolvedValue(buildRecord()),
          consume: vi.fn().mockResolvedValue(false),
        },
      })

      const result = await service.verifyAndConsume({ userId: 'user-1', code: '123456' })

      expect(result).toEqual({ outcome: 'invalid' })
    })
  })
})
