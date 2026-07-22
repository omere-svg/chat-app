import { MalformedResponseError } from '../malformedResponseError.ts'
import { isRecord, readNullableString, readNumber, readString } from './primitives.ts'
import type { AvatarResult, AvatarUploadTicket } from '../../types/api.ts'

function parseUploadFields(value: unknown): Record<string, string> {
  if (!isRecord(value)) {
    throw new MalformedResponseError('avatarUploadTicket.fields')
  }
  const fields: Record<string, string> = {}
  for (const [fieldName, fieldValue] of Object.entries(value)) {
    if (typeof fieldValue !== 'string') {
      throw new MalformedResponseError(`avatarUploadTicket.fields.${fieldName}`)
    }
    fields[fieldName] = fieldValue
  }
  return fields
}

export function parseAvatarResult(value: unknown): AvatarResult {
  if (!isRecord(value)) {
    throw new MalformedResponseError('avatarResult')
  }
  return {
    avatarUrl: readNullableString(value, 'avatarUrl', 'avatarResult'),
  }
}

export function parseAvatarUploadTicket(value: unknown): AvatarUploadTicket {
  if (!isRecord(value)) {
    throw new MalformedResponseError('avatarUploadTicket')
  }
  return {
    url: readString(value, 'url', 'avatarUploadTicket'),
    fields: parseUploadFields(value.fields),
    key: readString(value, 'key', 'avatarUploadTicket'),
    expiresInSeconds: readNumber(value, 'expiresInSeconds', 'avatarUploadTicket'),
  }
}
