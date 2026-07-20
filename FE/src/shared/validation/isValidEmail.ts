import { EMAIL_PATTERN, MAX_EMAIL_LENGTH } from './constants.ts'

export function isValidEmail(value: string): boolean {
  const email = value.trim()
  return email.length <= MAX_EMAIL_LENGTH && EMAIL_PATTERN.test(email)
}
