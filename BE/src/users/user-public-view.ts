import type { UserRecord } from './user.entity.js'

export interface PublicUser {
  id: string
  email: string
  displayName: string
  avatarUrl?: string
}

export function toPublicUser(userRecord: UserRecord): PublicUser {
  const publicUser: PublicUser = {
    id: userRecord.id,
    email: userRecord.email,
    displayName: userRecord.displayName,
  }

  if (userRecord.avatarUrl !== undefined) {
    publicUser.avatarUrl = userRecord.avatarUrl
  }

  return publicUser
}
