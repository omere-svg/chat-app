import type { UserRecord } from './user.entity.js'

export interface PublicUser {
  id: string
  email: string
  firstName: string
  lastName: string
}

export function toPublicUser(userRecord: UserRecord): PublicUser {
  return {
    id: userRecord.id,
    email: userRecord.email,
    firstName: userRecord.firstName,
    lastName: userRecord.lastName,
  }
}

// Composes a person's full name for display (e.g. conversation titles). Collapses any
// incidental extra whitespace so a missing part never yields a leading/trailing space.
export function formatFullName(user: Pick<PublicUser, 'firstName' | 'lastName'>): string {
  return `${user.firstName} ${user.lastName}`.trim().replace(/\s+/g, ' ')
}
