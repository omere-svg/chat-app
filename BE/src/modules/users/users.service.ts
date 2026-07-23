import { Inject, Injectable } from '@nestjs/common'
import { randomUUID } from 'node:crypto'
import { PasswordHasher } from './password-hasher.js'
import { USER_REPOSITORY } from './user.repository.js'
import { toUser } from './user.mapper.js'
import { isSessionSuperseded } from './session-freshness.js'
import { EmailAlreadyRegisteredError } from './errors/email-already-registered.error.js'
import { UserNotFoundError } from './errors/user-not-found.error.js'
import { UnknownParticipantEmailsError } from './errors/unknown-participant-emails.error.js'
import { normalizeEmail } from '../../shared/validation/normalize-email.js'
import type { DemoUserSeed } from '../../shared/seed/types/demo-user-seed.js'
import type { UserRepository } from './user.repository.js'
import type { User } from './types/user.js'
import type { StoredAvatar } from './types/stored-avatar.js'
import type { UserRecord } from './types/user.entity.js'
import type { AuthenticatedUserResolution } from './types/authenticated-user-resolution.js'
import type {
  CreateUserInput,
  UpdateNameInput,
  VerifyCredentialsInput,
} from './types/user-service.types.js'

@Injectable()
export class UsersService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  toUser(userRecord: UserRecord): User {
    return toUser(userRecord)
  }

  async seedDemoUsersIfEmpty(
    demoUsers: readonly DemoUserSeed[],
    plainPassword: string,
  ): Promise<number> {
    if (!(await this.userRepository.isEmpty())) {
      return 0
    }

    const passwordHash = await this.passwordHasher.hash(plainPassword)
    for (const demoUser of demoUsers) {
      await this.userRepository.insert({
        id: demoUser.id,
        email: demoUser.email,
        firstName: demoUser.firstName,
        lastName: demoUser.lastName,
        passwordHash,
        avatar: null,
        previousEmails: [],
      })
    }
    return demoUsers.length
  }

  async createUser(createUserInput: CreateUserInput): Promise<UserRecord> {
    const normalizedEmail = normalizeEmail(createUserInput.email)

    const existingUser = await this.userRepository.findByEmail(normalizedEmail)
    if (existingUser !== null) {
      throw new EmailAlreadyRegisteredError()
    }

    const passwordHash = await this.passwordHasher.hash(createUserInput.password)
    const userRecord: UserRecord = {
      id: `user-${randomUUID()}`,
      email: normalizedEmail,
      passwordHash,
      firstName: createUserInput.firstName,
      lastName: createUserInput.lastName,
      avatar: null,
      previousEmails: [],
      sessionsInvalidatedAt: null,
    }

    return this.userRepository.insert(userRecord)
  }

  async updateName(userId: string, { firstName, lastName }: UpdateNameInput): Promise<User> {
    const updatedUser = await this.userRepository.update(userId, {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
    })
    if (updatedUser === null) {
      throw new UserNotFoundError()
    }
    return this.toUser(updatedUser)
  }

  async getUserRecord(userId: string): Promise<UserRecord> {
    const existingUser = await this.userRepository.findById(userId)
    if (existingUser === null) {
      throw new UserNotFoundError()
    }
    return existingUser
  }

  async updateAvatar(userId: string, avatar: StoredAvatar): Promise<User> {
    const updatedUser = await this.userRepository.update(userId, { avatar })
    if (updatedUser === null) {
      throw new UserNotFoundError()
    }
    return this.toUser(updatedUser)
  }

  async clearAvatar(userId: string): Promise<User> {
    const updatedUser = await this.userRepository.update(userId, { avatar: null })
    if (updatedUser === null) {
      throw new UserNotFoundError()
    }
    return this.toUser(updatedUser)
  }

  async getPreviousEmails(userId: string): Promise<string[]> {
    const existingUser = await this.getUserRecord(userId)
    return existingUser.previousEmails
  }

  async assertEmailAvailable(email: string, forUserId: string): Promise<void> {
    const emailOwner = await this.userRepository.findByEmail(normalizeEmail(email))
    if (emailOwner !== null && emailOwner.id !== forUserId) {
      throw new EmailAlreadyRegisteredError()
    }
  }

  async applyConfirmedEmailChange(userId: string, newEmail: string): Promise<User> {
    await this.getUserRecord(userId)

    const normalizedEmail = normalizeEmail(newEmail)
    await this.assertEmailAvailable(normalizedEmail, userId)

    const result = await this.userRepository.applyConfirmedEmailChange({
      userId,
      newEmail: normalizedEmail,
    })
    if (result.outcome === 'not-found') {
      throw new UserNotFoundError()
    }
    if (result.outcome === 'email-taken') {
      throw new EmailAlreadyRegisteredError()
    }
    return this.toUser(result.user)
  }

  async verifyCredentials({ email, password }: VerifyCredentialsInput): Promise<UserRecord | null> {
    const userRecord = await this.userRepository.findByEmail(normalizeEmail(email))
    if (userRecord === null) {
      return null
    }

    const passwordMatches = await this.passwordHasher.verify(password, userRecord.passwordHash)
    return passwordMatches ? userRecord : null
  }

  async findUserById(userId: string): Promise<User | null> {
    const userRecord = await this.userRepository.findById(userId)
    return userRecord === null ? null : this.toUser(userRecord)
  }

  async findRecordByEmail(email: string): Promise<UserRecord | null> {
    return this.userRepository.findByEmail(normalizeEmail(email))
  }

  async resetPassword(userId: string, newPassword: string): Promise<void> {
    const passwordHash = await this.passwordHasher.hash(newPassword)
    const applied = await this.userRepository.applyPasswordReset({
      userId,
      passwordHash,
      sessionsInvalidatedAt: new Date(),
    })
    if (!applied) {
      throw new UserNotFoundError()
    }
  }

  async resolveAuthenticatedUser(
    userId: string,
    tokenIssuedAtSeconds: number | undefined,
  ): Promise<AuthenticatedUserResolution> {
    const userRecord = await this.userRepository.findById(userId)
    if (userRecord === null) {
      return { outcome: 'not-found' }
    }
    if (isSessionSuperseded(userRecord.sessionsInvalidatedAt, tokenIssuedAtSeconds)) {
      return { outcome: 'session-revoked' }
    }
    return { outcome: 'authenticated', user: this.toUser(userRecord) }
  }

  async findUsersByIds(userIds: readonly string[]): Promise<User[]> {
    const userRecords = await this.userRepository.findByIds(userIds)
    return userRecords.map((userRecord) => this.toUser(userRecord))
  }

  async resolveExistingUsersByEmails(emails: readonly string[]): Promise<User[]> {
    const normalizedByOriginal = emails.map((email) => ({
      original: email,
      normalized: normalizeEmail(email),
    }))

    const foundUsers = await this.userRepository.findByEmails(
      normalizedByOriginal.map((entry) => entry.normalized),
    )
    const foundEmails = new Set(foundUsers.map((user) => normalizeEmail(user.email)))

    const unknownEmails = normalizedByOriginal
      .filter((entry) => !foundEmails.has(entry.normalized))
      .map((entry) => entry.original)
    if (unknownEmails.length > 0) {
      throw new UnknownParticipantEmailsError(unknownEmails)
    }

    return foundUsers.map((foundUser) => this.toUser(foundUser))
  }
}
