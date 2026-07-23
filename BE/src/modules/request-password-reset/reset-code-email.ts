import { RESET_CODE_EMAIL_SUBJECT, SECONDS_PER_MINUTE } from './constants.js'
import { OTP_TTL_SECONDS } from '../password-reset-otp/constants.js'
import type { EmailMessage } from '../email-sender/types/email-message.js'
import type { ResetCodeEmailInput } from './types/reset-code-email-input.js'

export function buildResetCodeEmail({ to, code }: ResetCodeEmailInput): EmailMessage {
  const expiryMinutes = Math.floor(OTP_TTL_SECONDS / SECONDS_PER_MINUTE)

  const textBody = [
    'We received a request to reset your password.',
    `Your password reset code is: ${code}`,
    `This code expires in ${expiryMinutes.toString()} minutes and can be used once.`,
    'If you did not request this, you can ignore this email.',
  ].join('\n\n')

  const htmlBody = [
    '<p>We received a request to reset your password.</p>',
    `<p>Your password reset code is: <strong>${code}</strong></p>`,
    `<p>This code expires in ${expiryMinutes.toString()} minutes and can be used once.</p>`,
    '<p>If you did not request this, you can ignore this email.</p>',
  ].join('')

  return {
    to,
    subject: RESET_CODE_EMAIL_SUBJECT,
    htmlBody,
    textBody,
  }
}
