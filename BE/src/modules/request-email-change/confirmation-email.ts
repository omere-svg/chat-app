import { CONFIRMATION_EMAIL_SUBJECT, HTML_ENTITIES } from './constants.js'
import type { EmailMessage } from '../email-sender/types/email-message.js'
import type { ConfirmationEmailInput } from './types/confirmation-email-input.js'

export function buildConfirmationEmail({
  newEmail,
  confirmationUrl,
}: ConfirmationEmailInput): EmailMessage {
  const textBody = [
    'You requested to change your account email address.',
    `Confirm ${newEmail} by opening this link:`,
    confirmationUrl,
    'If you did not request this change, you can ignore this email.',
  ].join('\n\n')

  const htmlBody = [
    '<p>You requested to change your account email address.</p>',
    `<p>Confirm <strong>${escapeHtml(newEmail)}</strong> by clicking the link below:</p>`,
    `<p><a href="${confirmationUrl}">Confirm email change</a></p>`,
    '<p>If you did not request this change, you can ignore this email.</p>',
  ].join('')

  return {
    to: newEmail,
    subject: CONFIRMATION_EMAIL_SUBJECT,
    htmlBody,
    textBody,
  }
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => HTML_ENTITIES[character] ?? character)
}
