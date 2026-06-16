import { Injectable, Logger } from '@nestjs/common'
import type { OnModuleInit } from '@nestjs/common'
import { PasswordHasher } from '../password-hasher.js'
import type { UserRepository } from './user-repository.port.js'
import type { UserRecord } from '../user.entity.js'

interface DemoUserSeed {
  id: string
  email: string
  displayName: string
}

const DEMO_USER_PASSWORD = 'password123'

const DEMO_USER_SEEDS: readonly DemoUserSeed[] = [
  { id: 'user-alice', email: 'alice@example.com', displayName: 'Alice' },
  { id: 'user-bob', email: 'bob@example.com', displayName: 'Bob' },
  { id: 'user-carol', email: 'carol@example.com', displayName: 'Carol' },
]

@Injectable()
export class InMemoryUserRepository implements UserRepository, OnModuleInit {
  private readonly logger = new Logger(InMemoryUserRepository.name)
  private readonly usersById = new Map<string, UserRecord>()

  constructor(private readonly passwordHasher: PasswordHasher) {}

  async onModuleInit(): Promise<void> {
    const seedPasswordHash = await this.passwordHasher.hash(DEMO_USER_PASSWORD)

    for (const demoUserSeed of DEMO_USER_SEEDS) {
      const userRecord: UserRecord = {
        id: demoUserSeed.id,
        email: demoUserSeed.email,
        passwordHash: seedPasswordHash,
        displayName: demoUserSeed.displayName,
      }
      this.usersById.set(userRecord.id, userRecord)
    }

    this.logger.log(`Seeded ${this.usersById.size.toString()} demo users`)
  }

  findById(userId: string): Promise<UserRecord | null> {
    const userRecord = this.usersById.get(userId)
    return Promise.resolve(userRecord === undefined ? null : { ...userRecord })
  }

  findByEmail(normalizedEmail: string): Promise<UserRecord | null> {
    for (const userRecord of this.usersById.values()) {
      if (userRecord.email === normalizedEmail) {
        return Promise.resolve({ ...userRecord })
      }
    }
    return Promise.resolve(null)
  }

  findByEmails(normalizedEmails: readonly string[]): Promise<UserRecord[]> {
    const wanted = new Set(normalizedEmails)
    const matches: UserRecord[] = []
    for (const userRecord of this.usersById.values()) {
      if (wanted.has(userRecord.email)) {
        matches.push({ ...userRecord })
      }
    }
    return Promise.resolve(matches)
  }

  insert(userRecord: UserRecord): Promise<UserRecord> {
    const storedUser: UserRecord = { ...userRecord }
    this.usersById.set(storedUser.id, storedUser)
    return Promise.resolve({ ...storedUser })
  }
}
