import { MalformedResponseError } from '../malformedResponseError.ts'
import {
  isRecord,
  readNullableString,
  readOptionalString,
  readString,
  readStringArray,
} from './primitives.ts'
import type {
  AuthResponse,
  ConfirmEmailChangeResponse,
  PreviousEmailsResponse,
} from '../../types/api.ts'
import type { User } from '../../types/domain.ts'

function parseUser(value: unknown): User {
  if (!isRecord(value)) {
    throw new MalformedResponseError('user')
  }
  return {
    id: readString(value, 'id', 'user'),
    firstName: readString(value, 'firstName', 'user'),
    lastName: readString(value, 'lastName', 'user'),
    email: readOptionalString(value, 'email', 'user'),
    avatarUrl: readNullableString(value, 'avatarUrl', 'user'),
  }
}

export function parseAuthResponse(value: unknown): AuthResponse {
  if (!isRecord(value)) {
    throw new MalformedResponseError('authResponse')
  }
  return {
    token: readString(value, 'token', 'authResponse'),
    user: parseUser(value.user),
  }
}

export function parseUserResponse(value: unknown): User {
  return parseUser(value)
}

export function parsePreviousEmailsResponse(value: unknown): PreviousEmailsResponse {
  if (!isRecord(value)) {
    throw new MalformedResponseError('previousEmailsResponse')
  }
  return { previousEmails: readStringArray(value, 'previousEmails', 'previousEmailsResponse') }
}

export function parseConfirmEmailChangeResponse(value: unknown): ConfirmEmailChangeResponse {
  if (!isRecord(value)) {
    throw new MalformedResponseError('confirmEmailChangeResponse')
  }
  return {
    ...parseUser(value),
    email: readString(value, 'email', 'confirmEmailChangeResponse'),
  }
}
