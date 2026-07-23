import { CONFIRM_EMAIL_PATH, CONFIRM_EMAIL_TOKEN_PARAM } from './constants.js'

export function buildConfirmationUrl(frontendOrigin: string, token: string): string {
  const url = new URL(CONFIRM_EMAIL_PATH, frontendOrigin)
  url.searchParams.set(CONFIRM_EMAIL_TOKEN_PARAM, token)
  return url.toString()
}
