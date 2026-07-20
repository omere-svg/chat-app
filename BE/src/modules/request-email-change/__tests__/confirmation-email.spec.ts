import { describe, expect, it } from 'vitest'
import { buildConfirmationEmail } from '../confirmation-email.js'

describe('buildConfirmationEmail', () => {
  it('escapes the displayed email without changing the recipient or text body', () => {
    const email = buildConfirmationEmail({
      newEmail: '"</strong><a href=https://evil.test>click</a>"@example.com',
      confirmationUrl: 'https://app.example/confirm-email?token=safe',
    })

    expect(email.to).toBe('"</strong><a href=https://evil.test>click</a>"@example.com')
    expect(email.textBody).toContain('"</strong><a href=https://evil.test>click</a>"@example.com')
    expect(email.htmlBody).not.toContain('</strong><a href=https://evil.test>')
    expect(email.htmlBody).toContain('&lt;/strong&gt;')
  })
})
