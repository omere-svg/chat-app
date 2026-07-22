import { describe, expect, it } from 'vitest'
import { isSessionSuperseded } from '../session-freshness.js'

describe('isSessionSuperseded', () => {
  it('never supersedes when no invalidation has happened', () => {
    expect(isSessionSuperseded(null, 1000)).toBe(false)
    expect(isSessionSuperseded(undefined, 1000)).toBe(false)
  })

  it('supersedes a token issued before the invalidation time', () => {
    const invalidatedAt = new Date(10_000_000)
    const issuedAtSeconds = 9999

    expect(isSessionSuperseded(invalidatedAt, issuedAtSeconds)).toBe(true)
  })

  it('keeps a token issued at or after the invalidation time', () => {
    const invalidatedAt = new Date(10_000_000)
    const issuedAtSeconds = 10_000

    expect(isSessionSuperseded(invalidatedAt, issuedAtSeconds)).toBe(false)
  })

  it('supersedes when the token carries no issued-at and sessions were invalidated', () => {
    expect(isSessionSuperseded(new Date(), undefined)).toBe(true)
  })
})
