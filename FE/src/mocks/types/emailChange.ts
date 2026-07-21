export type EmailChangeTokenPayload = {
  userId: string
  newEmail: string
}

export type MockRequestEmailChangeOutcome =
  | { token: string }
  | { error: 'VALIDATION_ERROR' | 'EMAIL_ALREADY_REGISTERED' }

export type MockConfirmEmailChangeOutcome<TUser> =
  | { user: TUser }
  | { error: 'EMAIL_CHANGE_TOKEN_INVALID' | 'EMAIL_ALREADY_REGISTERED' }
