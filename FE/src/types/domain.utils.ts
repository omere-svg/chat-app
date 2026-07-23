import type { User } from './domain.ts'

export function fullName(user: Pick<User, 'firstName' | 'lastName'>): string {
  return `${user.firstName} ${user.lastName}`.trim().replace(/\s+/g, ' ')
}
