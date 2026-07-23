import { describe, expect, it } from 'vitest'
import { parseConfirmEmailChangeResponse } from './parseApiResponse.ts'

describe('parseConfirmEmailChangeResponse', () => {
  it('rejects a confirmation response without email', () => {
    const userWithoutEmail = {
      id: 'user-1',
      firstName: 'New',
      lastName: 'Name',
      avatarUrl: null,
    }

    expect(() => parseConfirmEmailChangeResponse(userWithoutEmail)).toThrow(
      'Malformed server response at confirmEmailChangeResponse.email',
    )
  })
})
